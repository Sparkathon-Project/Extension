chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === 'TAKE_SCREENSHOT') {
        const responseCallback = sendResponse;

        // Capture the visible tab of the current window
        chrome.tabs.captureVisibleTab({ format: 'png' }, async (dataUrl) => {
            if (chrome.runtime.lastError) {
                responseCallback({ status: 'error', message: chrome.runtime.lastError.message });
                return;
            }

            if (dataUrl) {
                responseCallback({ status: 'success' });

                const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
                if (tab && tab.id) {
                    try {
                        chrome.tabs.sendMessage(tab.id, {
                            type: "MARK_SCREEN",
                            dataUrl: dataUrl
                        }).then(contentResponse => {
                            console.log('Content script responded:', contentResponse);
                        }).catch(error => {
                            console.error('Error sending message to content script or content script failed:', error);
                        });
                    } catch (e) {
                        console.error('Error querying tab or sending message:', e);
                    }
                } else {
                    console.error('No active tab found to send screenshot data.');
                }
            } else {
                console.log('No data URL received from captureVisibleTab.');
                responseCallback({ status: 'error', message: 'No data URL received' });
            }
        });
        return true; // Important: Keep the message channel open for the async response
    }
    return false; // Don't keep message channel open for unknown message types
});
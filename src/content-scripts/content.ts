interface Point {
    x: number;
    y: number;
}
interface SearchMessage {
    type: 'SEARCH_DATA';
    query: string;
    clicks: [number, number][];
    imageBlob: Blob | null;
}

class Overlay {
    private container: HTMLDivElement;
    private imageContainer!: HTMLDivElement;
    private screenshot: string;
    private clicks: Point[] = [];
    private displayScale: number = 1;

    constructor(screenshot: string) {
        this.screenshot = screenshot;
        this.container = this.createContainer();
        this.setupOverlay();
        this.hideBodyOverflow();
    }

    private createContainer(): HTMLDivElement {
        const container = document.createElement('div');
        container.id = 'overlay';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 999999;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        return container;
    }

    private setupOverlay() {
        this.imageContainer = document.createElement('div');
        this.imageContainer.style.cssText = `
            position: relative;
            max-width: 90vw;
            max-height: 80vh;
            overflow: hidden;
            border: 2px solid #2196f3;
            border-radius: 8px;
            cursor: crosshair;
        `;

        const img = document.createElement('img');
        img.src = this.screenshot;
        img.style.cssText = `
            display: block;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        `;

        img.onload = () => {
            this.displayScale = img.offsetWidth / img.naturalWidth;
            img.addEventListener('click', this.handleImageClick.bind(this));
            this.updateUI();
        };

        this.imageContainer.appendChild(img);
        this.container.appendChild(this.imageContainer);

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000000;
            display: flex;
            flex-direction: column;
            gap: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 12px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            align-items: center;
        `;

        const instructions = document.createElement('div');
        instructions.style.cssText = `
            color: #fff;
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin-right: 10px;
            line-height: 1.4;
        `;
        instructions.innerHTML = `
            <strong>Click on the image to mark object or enter a query</strong>
        `;
        toolbar.appendChild(instructions);

        // Query input
        const queryInput = document.createElement('input');
        queryInput.type = 'text';
        queryInput.placeholder = 'Enter your query...';
        queryInput.id = 'query-input';
        queryInput.style.cssText = `
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #ccc;
            min-width: 240px;
            font-size: 14px;
            font-family: Arial, sans-serif;
            transition: all 0.2s;
        `;
        queryInput.addEventListener('focus', () => {
            queryInput.style.borderColor = '#2196f3';
            queryInput.style.boxShadow = '0 0 6px #2196f3';
        });
        queryInput.addEventListener('blur', () => {
            queryInput.style.borderColor = '#ccc';
            queryInput.style.boxShadow = 'none';
        });
        queryInput.addEventListener('input', () => {
            this.updateUI();
        });
        toolbar.appendChild(queryInput);

        this.container.appendChild(toolbar);

        // Actions
        const actionsContainer = document.createElement('div');
        actionsContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000000;
            display: flex;
            gap: 8px;
        `;

        const searchButton = document.createElement('button');
        searchButton.textContent = 'Search';
        searchButton.style.cssText = `
            padding: 10px 16px;
            background: #4caf50;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.2s;
        `;
        searchButton.id = 'search-button';
        searchButton.addEventListener('click', () => {
            const queryInput = document.getElementById('query-input') as HTMLInputElement;
            const query = queryInput?.value.trim() || '';
            this.openWebsite(query);
        });
        searchButton.addEventListener('mouseenter', () => {
            if (!searchButton.disabled) {
                searchButton.style.background = '#45a049';
                searchButton.style.transform = 'scale(1.05)';
            }
        });
        searchButton.addEventListener('mouseleave', () => {
            searchButton.style.background = '#4caf50';
            searchButton.style.transform = 'scale(1)';
        });
        actionsContainer.appendChild(searchButton);

        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear';
        clearButton.style.cssText = `
            padding: 10px 16px;
            background: #ff9800;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.2s;
        `;
        clearButton.addEventListener('click', this.clearClicks.bind(this));
        clearButton.addEventListener('mouseenter', () => {
            clearButton.style.background = '#f57c00';
            clearButton.style.transform = 'scale(1.05)';
        });
        clearButton.addEventListener('mouseleave', () => {
            clearButton.style.background = '#ff9800';
            clearButton.style.transform = 'scale(1)';
        });
        actionsContainer.appendChild(clearButton);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            padding: 10px 16px;
            background: #f44336;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.2s;
        `;
        closeButton.addEventListener('click', this.cleanup.bind(this));
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = '#d32f2f';
            closeButton.style.transform = 'scale(1.05)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = '#f44336';
            closeButton.style.transform = 'scale(1)';
        });
        actionsContainer.appendChild(closeButton);

        this.container.appendChild(actionsContainer);

        // Status container
        const statusContainer = document.createElement('div');
        statusContainer.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000000;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            display: none;
            backdrop-filter: blur(10px);
        `;
        statusContainer.id = 'status-container';
        this.container.appendChild(statusContainer);

        document.body.appendChild(this.container);
    }

    private handleImageClick(event: MouseEvent) {
        const rect = (event.target as HTMLImageElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const originalX = Math.round(x / this.displayScale);
        const originalY = Math.round(y / this.displayScale);
        this.clicks.push({ x: originalX, y: originalY });
        this.addClickIndicator(x, y);
        this.updateUI();
    }

    private addClickIndicator(x: number, y: number) {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: absolute;
            left: ${x - 6}px;
            top: ${y - 6}px;
            width: 12px;
            height: 12px;
            background: #ff4444;
            border: 2px solid #fff;
            border-radius: 50%;
            pointer-events: none;
            box-shadow: 0 0 8px rgba(255, 68, 68, 0.6);
            z-index: 10;
        `;
        indicator.className = 'click-indicator';
        this.imageContainer.appendChild(indicator);
    }

    private updateUI() {
        const searchButton = document.getElementById('search-button') as HTMLButtonElement;
        const queryInput = document.getElementById('query-input') as HTMLInputElement;

        const hasQuery = queryInput?.value.trim().length > 0;
        const hasPoints = this.clicks.length > 0;

        if (searchButton) {
            searchButton.disabled = !hasQuery && !hasPoints;
            searchButton.style.opacity = searchButton.disabled ? '0.5' : '1';
        }
    }

    private clearClicks() {
        this.clicks = [];
        const indicators = this.imageContainer.querySelectorAll('.click-indicator');
        indicators.forEach(indicator => indicator.remove());
        this.updateUI();
    }

    private showStatus(message: string, type: 'info' | 'error' | 'success' = 'info') {
        const statusContainer = document.getElementById('status-container');
        if (!statusContainer) return;

        const colors = {
            info: '#2196f3',
            error: '#f44336',
            success: '#4caf50'
        };

        statusContainer.style.background = `rgba(0, 0, 0, 0.8)`;
        statusContainer.style.borderLeft = `4px solid ${colors[type]}`;
        statusContainer.textContent = message;
        statusContainer.style.display = 'block';

        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                this.hideStatus();
            }, 10000);
        }
    }

    private hideStatus() {
        const statusContainer = document.getElementById('status-container');
        if (statusContainer) {
            statusContainer.style.display = 'none';
        }
    }

    private async openWebsite(query: string): Promise<void> {
        const newWindow = window.open('http://localhost:3000/', '_blank');
        if (!newWindow) {
            console.error('Failed to open new window');
            return;
        }
        const clicks: [number, number][] = this.clicks.map(p => [p.x, p.y]);

        try {
            const response = await fetch(this.screenshot);
            const blob = await response.blob();

            const message: SearchMessage = {
                type: 'SEARCH_DATA',
                query,
                clicks,
                imageBlob: blob
            };

            const listener = (event: MessageEvent) => {
                if (event.source === newWindow && event.data === 'READY_FOR_DATA') {
                    newWindow.postMessage(message, '*');
                    window.removeEventListener('message', listener);
                }
            };
            window.addEventListener('message', listener);
        } catch (error) {
            console.error('Failed to fetch image blob:', error);
            this.showStatus("Error searching for your product", "error");
        } finally {
            this.hideStatus();
            this.cleanup();
        }
    }

    private hideBodyOverflow() {
        document.body.style.overflow = 'hidden';
    }

    private restoreBodyOverflow() {
        document.body.style.overflow = 'auto';
    }

    private cleanup() {
        this.restoreBodyOverflow();
        this.container.remove();
    }
}

// Listener for background script messages
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === "MARK_SCREEN" && message.dataUrl) {
        try {
            const existing = document.getElementById("overlay");
            if (existing) {
                existing.remove();
            }
            new Overlay(message.dataUrl);
            sendResponse({ success: true });
        } catch (error) {
            console.error('Error creating overlay:', error);
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            sendResponse({ success: false, error: errorMessage });
        }
        return true;
    }
    return false;
});
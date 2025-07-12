import React, { useState } from 'react';

const WalmartLensCapture: React.FC = () => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleScreenshotClick = () => {
        setIsLoading(true);
        setMessage('');

        chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' }, (response) => {
            setIsLoading(false);
            if (response?.status === 'success') {
                setMessage('Screenshot captured successfully!');
                window.close();
            } else {
                setMessage('Failed to capture screenshot. Please try again.');
            }
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Snap Cart</h1>
                <p style={styles.subtitle}>Capture what you see. Shop what you love.</p>
            </div>

            <div style={styles.body}>
                <button
                    onClick={handleScreenshotClick}
                    disabled={isLoading}
                    style={{
                        ...styles.button,
                        ...(isLoading ? styles.buttonLoading : {})
                    }}
                    onMouseEnter={(e) => {
                        if (!isLoading) e.currentTarget.style.transform = 'scale(1.03)';
                    }}
                    onMouseLeave={(e) => {
                        if (!isLoading) e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {isLoading ? (
                        <>
                            <div style={styles.spinner}></div>
                            Capturing...
                        </>
                    ) : (
                        <>Capture Screenshot</>
                    )}
                </button>

                {message && (
                    <div style={{
                        ...styles.message,
                        backgroundColor: message.includes('success') ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                        borderColor: message.includes('success') ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'
                    }}>
                        {message}
                    </div>
                )}
            </div>

            <div style={styles.footer}>Made by team Binary Brains</div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '360px',
        fontFamily: 'Segoe UI, sans-serif',
        background: '#0071CE',
        color: 'white',
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden'
    },
    header: {
        padding: '24px',
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(6px)'
    },
    title: {
        margin: 0,
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#FCB61A'
    },
    subtitle: {
        fontSize: '14px',
        opacity: 0.8,
        marginTop: '4px'
    },
    body: {
        padding: '24px'
    },
    button: {
        width: '100%',
        padding: '14px 20px',
        backgroundColor: '#FCB61A',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontWeight: 600,
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
    },
    buttonLoading: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        color: '#333',
        cursor: 'not-allowed'
    },
    spinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(0,0,0,0.1)',
        borderTop: '2px solid #333',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    message: {
        marginTop: '20px',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '14px',
        animation: 'fadeIn 0.3s ease'
    },
    footer: {
        padding: '18px',
        fontSize: '12px',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        opacity: 0.8
    }
};

export default WalmartLensCapture;
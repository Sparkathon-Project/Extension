### Prerequisites

*   [Node.js](https://nodejs.org/en/)
*   [npm](https://www.npmjs.com/)
*   [Google Chrome](https://www.google.com/chrome/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Sparkathon-Project/Extension.git
    cd Extension
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the extension:**
    This command compiles the code and bundles all the necessary files into the `dist` folder.
    ```bash
    npm run build
    ```

### Loading the Extension in Chrome

1.  Open Google Chrome and navigate to the extensions page: `chrome://extensions`.
2.  Enable **Developer mode** using the toggle switch in the top-right corner.
3.  Click the **"Load unpacked"** button that appears.
4.  In the file selection dialog, choose the `dist` folder from this project's directory.

The "Walmart Lens" extension should now appear in your list of extensions and be ready to use!

## How to Use

1.  Navigate to any webpage you want to capture.
2.  Click on the Walmart Lens extension icon in your Chrome toolbar.
3.  The extension popup will open, showing a screenshot of the current tab.
4.  Use the drawing tools in the popup to annotate the screenshot.
5.  Click the "Save" button to download the annotated image as a PNG file.

## Development 🛠️

If you want to contribute or work on the extension, you can run it in development mode with hot-reloading.

1.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will watch for file changes and automatically rebuild the extension.

2.  After making changes to the code, you may need to **reload the extension** in `chrome://extensions` for the changes to take effect in the background script or content scripts.

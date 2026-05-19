import * as vscode from 'vscode';
import { Logger } from '../shared/logger';
import { EXTENSION_NAME } from '../shared/constants';

const MODULE = 'ui:chat-panel';

/**
 * Webview provider for the AI Chat Panel.
 * Renders a React-based chat interface inside VS Code.
 */
export class ChatPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'contextFlow.chatPanel';
  private _view: vscode.WebviewView | undefined;
  private readonly _logger = Logger.getInstance();

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message: { type: string; payload?: unknown }) => {
      this._handleMessage(message);
    });

    this._logger.info(MODULE, 'Chat panel initialized');
  }

  /**
   * Send a message to the webview.
   */
  postMessage(message: { type: string; payload?: unknown }): void {
    if (this._view) {
      void this._view.webview.postMessage(message);
    }
  }

  private _handleMessage(message: { type: string; payload?: unknown }): void {
    switch (message.type) {
      case 'sendPrompt':
        this._logger.info(MODULE, 'Prompt received from UI');
        // Will be connected to the prompt engine pipeline
        break;
      case 'selectProvider':
        this._logger.info(MODULE, 'Provider selection changed');
        break;
      default:
        this._logger.debug(MODULE, `Unknown message type: ${message.type}`);
    }
  }

  private _getHtmlContent(_webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${EXTENSION_NAME}</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 16px;
      margin: 0;
    }
    .header {
      font-size: 1.2em;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--vscode-foreground);
    }
    .description {
      color: var(--vscode-descriptionForeground);
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .chat-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 200px);
    }
    .messages {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 16px;
      padding: 8px;
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
    }
    .input-area {
      display: flex;
      gap: 8px;
    }
    textarea {
      flex: 1;
      padding: 8px;
      border: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      resize: none;
      font-family: inherit;
      font-size: inherit;
      min-height: 60px;
    }
    textarea:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }
    button {
      padding: 8px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: inherit;
      align-self: flex-end;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .status {
      font-size: 0.85em;
      color: var(--vscode-descriptionForeground);
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">Context Flow AI Chat</div>
  <div class="description">
    Ask me to generate code. I'll automatically understand your repository context,
    enhance your prompt, and validate the output.
  </div>
  <div class="chat-container">
    <div class="messages" id="messages">
      <p style="color: var(--vscode-descriptionForeground); font-style: italic;">
        Start a conversation. Your prompts will be enhanced with project context automatically.
      </p>
    </div>
    <div class="input-area">
      <textarea id="prompt" placeholder="e.g., Create a payment checkout screen..."></textarea>
      <button id="send">Send</button>
    </div>
    <div class="status" id="status">Ready</div>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    const sendBtn = document.getElementById('send');
    const promptInput = document.getElementById('prompt');

    sendBtn.addEventListener('click', () => {
      const text = promptInput.value.trim();
      if (text) {
        vscode.postMessage({ type: 'sendPrompt', payload: text });
        promptInput.value = '';
      }
    });

    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        sendBtn.click();
      }
    });

    window.addEventListener('message', (event) => {
      const message = event.data;
      // Handle messages from extension
    });
  </script>
</body>
</html>`;
  }
}

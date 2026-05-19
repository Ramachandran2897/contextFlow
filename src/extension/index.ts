import * as vscode from 'vscode';
import { Logger } from '../shared/logger';
import { EventBus } from '../shared/events';
import { COMMANDS, CONFIG } from '../shared/constants';
import { RepositoryScanner } from '../scanner/index';
import { ContextEngine } from '../context-engine/index';
import { PromptEngine } from '../prompt-engine/index';
import { AIProviderRegistry, OpenAIProvider } from '../ai-providers/index';
import {
  ValidationEngine,
  ReactValidator,
  ArchitectureValidator,
  SecurityValidator,
} from '../validators/index';
import { MemoryEngine } from '../memory-engine/index';
import { TelemetryService } from '../telemetry/index';
import { ChatPanelProvider } from '../ui/index';

const MODULE = 'extension';

let logger: Logger;

export function activate(context: vscode.ExtensionContext): void {
  logger = Logger.getInstance();
  logger.info(MODULE, 'Context Flow activating...');

  // ─── Initialize Core Services ──────────────────────────────────────────────

  const scanner = new RepositoryScanner();
  const contextEngine = new ContextEngine(scanner);
  const promptEngine = new PromptEngine();
  const memoryEngine = new MemoryEngine();
  const telemetryService = new TelemetryService();
  const eventBus = EventBus.getInstance();

  // ─── Initialize AI Providers ───────────────────────────────────────────────

  const providerRegistry = new AIProviderRegistry();
  const openaiProvider = new OpenAIProvider();
  openaiProvider.setSecretStorage(context.secrets);
  providerRegistry.register(openaiProvider);

  // Set active provider from configuration
  const config = vscode.workspace.getConfiguration();
  const activeProvider = config.get<string>(CONFIG.AI_PROVIDER, 'openai');
  try {
    providerRegistry.setActive(activeProvider as 'openai' | 'anthropic' | 'gemini' | 'local');
  } catch {
    logger.warn(MODULE, `Provider "${activeProvider}" not available, defaulting to openai`);
  }

  // ─── Initialize Validators ─────────────────────────────────────────────────

  const validationEngine = new ValidationEngine();
  validationEngine.registerValidator(new ReactValidator());
  validationEngine.registerValidator(new ArchitectureValidator());
  validationEngine.registerValidator(new SecurityValidator());

  // ─── Initialize Telemetry ──────────────────────────────────────────────────

  const telemetryEnabled = config.get<boolean>(CONFIG.TELEMETRY_ENABLED, false);
  telemetryService.setEnabled(telemetryEnabled);

  // ─── Register UI Providers ─────────────────────────────────────────────────

  const chatPanelProvider = new ChatPanelProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatPanelProvider.viewType, chatPanelProvider),
  );

  // ─── Register Commands ─────────────────────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.SCAN_REPOSITORY, async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        void vscode.window.showWarningMessage('No workspace folder open.');
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Context Flow: Scanning repository...',
        },
        async () => {
          try {
            const result = await scanner.scan(workspaceFolder.uri.fsPath);
            void vscode.window.showInformationMessage(
              `Context Flow: Scan complete. Found ${result.structure.totalFiles} files, framework: ${result.framework.type}`,
            );
            eventBus.emit('scan:complete', result);
          } catch (error) {
            void vscode.window.showErrorMessage(
              `Context Flow: Scan failed — ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        },
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.OPEN_CHAT, () => {
      void vscode.commands.executeCommand('contextFlow.chatPanel.focus');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.ENHANCE_PROMPT, async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter your prompt to enhance',
        placeHolder: 'e.g., Create a payment checkout screen',
      });

      if (!input) return;

      try {
        const context = await contextEngine.buildContext(input);
        const enhanced = await promptEngine.enhance(input, context);

        // Show enhanced prompt in a new document
        const doc = await vscode.workspace.openTextDocument({
          content: enhanced.enhanced,
          language: 'markdown',
        });
        await vscode.window.showTextDocument(doc, { preview: true });
      } catch (error) {
        void vscode.window.showErrorMessage(
          `Context Flow: Enhancement failed — ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.VALIDATE_CODE, async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        void vscode.window.showWarningMessage('No active editor.');
        return;
      }

      const code = editor.document.getText();
      const filePath = editor.document.uri.fsPath;
      const framework = scanner.getFramework();

      const report = await validationEngine.validateCode(code, {
        filePath,
        framework: framework?.type ?? 'unknown',
        architecture: scanner.getArchitectureStyle() ?? 'unknown',
      });

      if (report.passed && report.issues.length === 0) {
        void vscode.window.showInformationMessage('Context Flow: No issues found ✓');
      } else {
        const issueMessages = report.issues.map((i) => `${i.severity.toUpperCase()}: ${i.message}`);
        void vscode.window
          .showWarningMessage(
            `Context Flow: ${report.issues.length} issue(s) found (Score: ${report.score}/100)`,
            'Show Details',
          )
          .then((selection) => {
            if (selection === 'Show Details') {
              const channel = vscode.window.createOutputChannel('Context Flow Validation');
              channel.appendLine(`Validation Report — ${filePath}`);
              channel.appendLine(`Score: ${report.score}/100`);
              channel.appendLine('');
              for (const msg of issueMessages) {
                channel.appendLine(`  • ${msg}`);
              }
              if (report.suggestions.length > 0) {
                channel.appendLine('');
                channel.appendLine('Suggestions:');
                for (const s of report.suggestions) {
                  channel.appendLine(`  → ${s.title}: ${s.description}`);
                }
              }
              channel.show();
            }
          });
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.SHOW_CONTEXT, async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'What are you trying to build?',
        placeHolder: 'e.g., payment checkout screen',
      });

      if (!input) return;

      try {
        const result = await contextEngine.buildContext(input);
        const doc = await vscode.workspace.openTextDocument({
          content: JSON.stringify(result, null, 2),
          language: 'json',
        });
        await vscode.window.showTextDocument(doc, { preview: true });
      } catch (error) {
        void vscode.window.showErrorMessage(
          `Context Flow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }),
  );

  // ─── Auto-scan on startup ──────────────────────────────────────────────────

  const scanOnStartup = config.get<boolean>(CONFIG.SCAN_ON_STARTUP, true);
  if (scanOnStartup) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      void scanner
        .scan(workspaceFolder.uri.fsPath)
        .then(() => {
          logger.info(MODULE, 'Auto-scan complete');
        })
        .catch((error: unknown) => {
          logger.warn(
            MODULE,
            `Auto-scan failed: ${error instanceof Error ? error.message : 'Unknown'}`,
          );
        });
    }
  }

  // ─── Configuration Change Listener ─────────────────────────────────────────

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('contextFlow')) {
        const newConfig = vscode.workspace.getConfiguration();
        telemetryService.setEnabled(newConfig.get<boolean>(CONFIG.TELEMETRY_ENABLED, false));
        logger.info(MODULE, 'Configuration updated');
      }
    }),
  );

  logger.info(MODULE, 'Context Flow activated successfully');
}

export function deactivate(): void {
  logger?.info(MODULE, 'Context Flow deactivating...');
  EventBus.getInstance().dispose();
  logger?.dispose();
}

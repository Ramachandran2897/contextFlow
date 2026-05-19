import * as vscode from 'vscode';
import { OUTPUT_CHANNEL_NAME } from './constants';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Centralized logger that writes to VS Code OutputChannel.
 * Never uses console.log directly.
 */
export class Logger {
  private static _instance: Logger | undefined;
  private readonly _channel: vscode.OutputChannel;

  private constructor() {
    this._channel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  }

  static getInstance(): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger();
    }
    return Logger._instance;
  }

  debug(module: string, message: string, data?: unknown): void {
    this._log('debug', module, message, data);
  }

  info(module: string, message: string, data?: unknown): void {
    this._log('info', module, message, data);
  }

  warn(module: string, message: string, data?: unknown): void {
    this._log('warn', module, message, data);
  }

  error(module: string, message: string, error?: unknown): void {
    this._log('error', module, message, error);
  }

  show(): void {
    this._channel.show();
  }

  dispose(): void {
    this._channel.dispose();
  }

  private _log(level: LogLevel, module: string, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${module}]`;
    const logMessage = data
      ? `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
      : `${prefix} ${message}`;

    this._channel.appendLine(logMessage);
  }
}

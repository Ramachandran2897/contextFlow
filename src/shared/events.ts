import * as vscode from 'vscode';

export interface Disposable {
  dispose(): void;
}

/**
 * Simple event bus for cross-module communication.
 * Uses VS Code's EventEmitter under the hood.
 */
export class EventBus {
  private static _instance: EventBus | undefined;
  private readonly _emitters = new Map<string, vscode.EventEmitter<unknown>>();

  static getInstance(): EventBus {
    if (!EventBus._instance) {
      EventBus._instance = new EventBus();
    }
    return EventBus._instance;
  }

  emit<T>(event: string, data: T): void {
    const emitter = this._getOrCreateEmitter(event);
    emitter.fire(data);
  }

  on<T>(event: string, handler: (data: T) => void): Disposable {
    const emitter = this._getOrCreateEmitter(event);
    return emitter.event((data) => handler(data as T));
  }

  dispose(): void {
    for (const emitter of this._emitters.values()) {
      emitter.dispose();
    }
    this._emitters.clear();
  }

  private _getOrCreateEmitter(event: string): vscode.EventEmitter<unknown> {
    let emitter = this._emitters.get(event);
    if (!emitter) {
      emitter = new vscode.EventEmitter<unknown>();
      this._emitters.set(event, emitter);
    }
    return emitter;
  }
}

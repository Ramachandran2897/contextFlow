import * as vscode from 'vscode';
import type {
  RepositoryScanResult,
  FrameworkInfo,
  FrameworkType,
  DependencyGraph,
  ArchitectureStyle,
  FolderStructure,
  DirectoryNode,
  NamingConventions,
  FeatureModule,
} from '../shared/types/index';
import { ScannerError } from '../shared/errors';
import { Logger } from '../shared/logger';
import { shouldIgnorePath, isScannableFile } from '../shared/utils/index';
import { MAX_SCAN_DEPTH } from '../shared/constants';
import type { IRepositoryScanner } from './interfaces';

const MODULE = 'scanner';

export class RepositoryScanner implements IRepositoryScanner {
  private _lastResult: RepositoryScanResult | undefined;
  private readonly _logger = Logger.getInstance();

  async scan(workspaceRoot: string): Promise<RepositoryScanResult> {
    this._logger.info(MODULE, `Scanning repository: ${workspaceRoot}`);

    try {
      const [framework, structure, architecture, conventions, modules] = await Promise.all([
        this._detectFramework(workspaceRoot),
        this._buildFolderStructure(workspaceRoot),
        this._detectArchitecture(workspaceRoot),
        this._detectConventions(workspaceRoot),
        this._detectModules(workspaceRoot),
      ]);

      const dependencies = await this._buildDependencyGraph(workspaceRoot);

      const result: RepositoryScanResult = {
        framework,
        structure,
        dependencies,
        architecture,
        conventions,
        modules,
        scannedAt: new Date(),
      };

      this._lastResult = result;
      this._logger.info(MODULE, 'Repository scan complete', {
        framework: framework.type,
        architecture,
        totalFiles: structure.totalFiles,
        modules: modules.length,
      });

      return result;
    } catch (error) {
      throw new ScannerError(
        `Failed to scan repository: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SCAN_FAILED',
        error instanceof Error ? error : undefined,
      );
    }
  }

  getFramework(): FrameworkInfo | undefined {
    return this._lastResult?.framework;
  }

  getDependencyGraph(): DependencyGraph | undefined {
    return this._lastResult?.dependencies;
  }

  getArchitectureStyle(): ArchitectureStyle | undefined {
    return this._lastResult?.architecture;
  }

  getLastScanResult(): RepositoryScanResult | undefined {
    return this._lastResult;
  }

  invalidateCache(): void {
    this._lastResult = undefined;
    this._logger.debug(MODULE, 'Cache invalidated');
  }

  private async _detectFramework(workspaceRoot: string): Promise<FrameworkInfo> {
    const packageJsonUri = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), 'package.json');

    try {
      const content = await vscode.workspace.fs.readFile(packageJsonUri);
      const packageJson = JSON.parse(Buffer.from(content).toString()) as Record<string, unknown>;
      const deps = {
        ...(packageJson.dependencies as Record<string, string> | undefined),
        ...(packageJson.devDependencies as Record<string, string> | undefined),
      };

      const type = this._identifyFrameworkType(deps);
      const version = this._getFrameworkVersion(deps, type);
      const language = deps['typescript'] ? 'typescript' : 'javascript';
      const packageManager = await this._detectPackageManager(workspaceRoot);

      return { type, version, language, packageManager };
    } catch {
      return { type: 'unknown', version: '', language: 'javascript', packageManager: 'npm' };
    }
  }

  private _identifyFrameworkType(deps: Record<string, string>): FrameworkType {
    if (deps['react-native']) return 'react-native';
    if (deps['next']) return 'nextjs';
    if (deps['react']) return 'react';
    if (deps['vue']) return 'vue';
    if (deps['@angular/core']) return 'angular';
    if (deps['svelte']) return 'svelte';
    if (deps['express'] || deps['fastify'] || deps['koa']) return 'node';
    return 'unknown';
  }

  private _getFrameworkVersion(deps: Record<string, string>, type: FrameworkType): string {
    const versionMap: Record<string, string | undefined> = {
      'react-native': deps['react-native'],
      nextjs: deps['next'],
      react: deps['react'],
      vue: deps['vue'],
      angular: deps['@angular/core'],
      svelte: deps['svelte'],
      node: deps['express'] ?? deps['fastify'] ?? deps['koa'],
    };
    return versionMap[type] ?? '';
  }

  private async _detectPackageManager(
    workspaceRoot: string,
  ): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'> {
    const root = vscode.Uri.file(workspaceRoot);
    const checks: Array<{ file: string; manager: 'yarn' | 'pnpm' | 'bun' }> = [
      { file: 'bun.lockb', manager: 'bun' },
      { file: 'pnpm-lock.yaml', manager: 'pnpm' },
      { file: 'yarn.lock', manager: 'yarn' },
    ];

    for (const { file, manager } of checks) {
      try {
        await vscode.workspace.fs.stat(vscode.Uri.joinPath(root, file));
        return manager;
      } catch {
        // File doesn't exist, continue
      }
    }
    return 'npm';
  }

  private async _buildFolderStructure(workspaceRoot: string): Promise<FolderStructure> {
    const rootUri = vscode.Uri.file(workspaceRoot);
    const srcDir = await this._findSrcDir(workspaceRoot);
    const directories = await this._scanDirectory(rootUri, 0);
    const totalFiles = this._countFiles(directories);

    return { root: workspaceRoot, srcDir, directories, totalFiles };
  }

  private async _findSrcDir(workspaceRoot: string): Promise<string> {
    const candidates = ['src', 'app', 'lib', 'source'];
    const root = vscode.Uri.file(workspaceRoot);

    for (const candidate of candidates) {
      try {
        const stat = await vscode.workspace.fs.stat(vscode.Uri.joinPath(root, candidate));
        if (stat.type === vscode.FileType.Directory) {
          return candidate;
        }
      } catch {
        // Directory doesn't exist
      }
    }
    return '.';
  }

  private async _scanDirectory(uri: vscode.Uri, depth: number): Promise<DirectoryNode[]> {
    if (depth >= MAX_SCAN_DEPTH) return [];

    try {
      const entries = await vscode.workspace.fs.readDirectory(uri);
      const nodes: DirectoryNode[] = [];

      for (const [name, type] of entries) {
        if (type !== vscode.FileType.Directory) continue;
        if (shouldIgnorePath(`/${name}/`)) continue;

        const childUri = vscode.Uri.joinPath(uri, name);
        const children = await this._scanDirectory(childUri, depth + 1);
        const fileCount = await this._countDirectFiles(childUri);

        nodes.push({ path: childUri.fsPath, name, children, fileCount });
      }

      return nodes;
    } catch {
      return [];
    }
  }

  private async _countDirectFiles(uri: vscode.Uri): Promise<number> {
    try {
      const entries = await vscode.workspace.fs.readDirectory(uri);
      return entries.filter(
        ([name, type]) => type === vscode.FileType.File && isScannableFile(name),
      ).length;
    } catch {
      return 0;
    }
  }

  private _countFiles(nodes: DirectoryNode[]): number {
    let count = 0;
    for (const node of nodes) {
      count += node.fileCount;
      count += this._countFiles(node.children);
    }
    return count;
  }

  private async _detectArchitecture(_workspaceRoot: string): Promise<ArchitectureStyle> {
    // Heuristic-based architecture detection
    // Will be enhanced with ts-morph in later phases
    const result = this._lastResult;
    if (!result) return 'unknown';

    const dirs = result.structure.directories.map((d) => d.name);

    if (dirs.includes('features') || dirs.includes('modules')) return 'feature-based';
    if (dirs.includes('atoms') || dirs.includes('molecules') || dirs.includes('organisms'))
      return 'atomic';
    if (dirs.includes('models') || dirs.includes('views') || dirs.includes('controllers'))
      return 'mvc';
    if (dirs.includes('domain') || dirs.includes('infrastructure') || dirs.includes('application'))
      return 'clean';
    if (dirs.includes('components') && dirs.includes('services') && dirs.includes('utils'))
      return 'layer-based';

    return 'unknown';
  }

  private async _detectConventions(_workspaceRoot: string): Promise<NamingConventions> {
    // Basic convention detection — will be enhanced later
    return {
      fileNaming: 'kebab-case',
      componentNaming: 'PascalCase',
      hookPrefix: true,
      indexBarrels: true,
    };
  }

  private async _detectModules(_workspaceRoot: string): Promise<FeatureModule[]> {
    // Placeholder — will use ts-morph for deep analysis
    return [];
  }

  private async _buildDependencyGraph(_workspaceRoot: string): Promise<DependencyGraph> {
    // Placeholder — will use ts-morph for import analysis
    return { nodes: [], edges: [] };
  }
}

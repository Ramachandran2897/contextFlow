import { IGNORED_DIRECTORIES, SCANNABLE_EXTENSIONS } from '../constants';

/**
 * Check if a file path should be ignored during scanning.
 */
export function shouldIgnorePath(filePath: string): boolean {
  return IGNORED_DIRECTORIES.some(
    (dir) => filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`),
  );
}

/**
 * Check if a file has a scannable extension.
 */
export function isScannableFile(filePath: string): boolean {
  return SCANNABLE_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

/**
 * Estimate token count from a string (rough approximation: ~4 chars per token).
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within a token budget.
 */
export function truncateToTokenBudget(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }
  return text.slice(0, maxChars) + '\n// ... truncated';
}

/**
 * Extract the file name without extension from a path.
 */
export function getFileNameWithoutExtension(filePath: string): string {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1] ?? '';
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

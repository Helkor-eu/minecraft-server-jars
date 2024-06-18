import { fileURLToPath } from 'url';
import path from 'path';

export const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

export function absolutePath(relativePath: string): string {
	return path.join(rootDirectory, relativePath);
}

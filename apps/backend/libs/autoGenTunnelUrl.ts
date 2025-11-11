import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __filename and __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_FILES = [
  path.resolve(__dirname, '../../../apps/frontend/apiUrl.ts'),
];

export async function setTunnelUrl(url: string): Promise<void> {
  if (!url) {
    throw new Error('TUNNEL URL is required');
  }

  const fileContents = `// Auto-generated file. Do not edit!
export const TUNNEL_API_URL = "${url}";
`;

  for (const filePath of TARGET_FILES) {
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, fileContents, 'utf8');

    console.log(`✅ Api url written succsefully`);
  }
}

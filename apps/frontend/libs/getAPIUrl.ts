// pkgs/convex-node/exportFile.ts

import * as url from '../apiUrl';

/**
 * Returns the ROUTE_API_URL from the generated file.
 * Throws if the file or export is missing.
 */
export function getBackendUrl(): string {
  // Named route api because of inital use

  if (!url.TUNNEL_API_URL) {
    throw new Error('[Frontend]: Tunnel API URL is not defined.');
  }
  return url.TUNNEL_API_URL;
}

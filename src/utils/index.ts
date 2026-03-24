export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

export function normalizeIpfsUrl(input?: string): string {
  if (!input) return '';
  let url = String(input).trim();
  url = url.replace(/^ipfs:\/\/(ipfs\/)?/i, 'https://ipfs.io/ipfs/');
  url = url.replace(/(\/ipfs\/)+/gi, '/ipfs/');
  url = url.replace(/(^https?:\/\/[^/]+)\/{2,}/i, '$1/');
  return url;
}
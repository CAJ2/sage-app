export const CDN_PREFIXES: Record<string, string> = {
  'cdn://sources': 'https://sage-leaf-sources.fra1.cdn.digitaloceanspaces.com',
}

/**
 * Expands a CDN URL from its internal format (e.g., cdn://sources/...)
 * to its full public URL.
 */
export function expandCdnUrl(url?: string): string | undefined {
  if (!url) return url

  for (const [prefix, replacement] of Object.entries(CDN_PREFIXES)) {
    if (url.startsWith(prefix)) {
      return url.replace(prefix, replacement)
    }
  }

  return url
}

/**
 * Shrinks a full CDN URL to its internal format (e.g., cdn://sources/...).
 */
export function shrinkCdnUrl(url?: string): string | undefined {
  if (!url) return url

  for (const [prefix, replacement] of Object.entries(CDN_PREFIXES)) {
    if (url.startsWith(replacement)) {
      return url.replace(replacement, prefix)
    }
  }

  return url
}

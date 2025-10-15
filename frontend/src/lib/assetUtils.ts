/**
 * Generates the correct asset URL based on the environment.
 * In development: /static/assets/...
 * In production: /assets/...
 */
export function getAssetUrl(assetPath: string): string {
  // Remove leading slash if present to normalize the path
  const normalizedPath = assetPath.startsWith("/")
    ? assetPath.slice(1)
    : assetPath;

  // In development (NODE_ENV !== 'production'), prepend /static
  // In production, use the path as-is with leading slash
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment) {
    // For development, add /static prefix
    return `/static/${normalizedPath}`;
  } else {
    // For production, ensure leading slash
    return `/${normalizedPath}`;
  }
}

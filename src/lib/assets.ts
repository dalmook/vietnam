const trimLeadingDotSlash = (path: string) => path.replace(/^\.\//, "").replace(/^\//, "");

export const resolvePublicAssetPath = (path: string) => {
  const normalizedBase = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${normalizedBase}${trimLeadingDotSlash(path)}`;
};

export const resolvePublicAssetUrl = (path: string) => new URL(resolvePublicAssetPath(path), window.location.origin).toString();

export const SITE_URL = (process.env.SITE_URL || "http://localhost:3030").replace(/\/+$/, "");
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

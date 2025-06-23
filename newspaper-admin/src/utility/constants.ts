const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const NEXT_PUBLIC_TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY;

export const API_URL = NEXT_PUBLIC_API_URL || "http://localhost:1338";
export const TOKEN_KEY = NEXT_PUBLIC_TOKEN_KEY || "strapi-jwt-token";
export const MEDIA_URL = API_URL; // Базовый URL для медиа файлов

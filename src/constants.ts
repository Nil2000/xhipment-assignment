export const ACCESS_TOKEN_EXPIRATION = "15m";
export const REFRESH_TOKEN_EXPIRATION = "7d";
export const REFRESH_TOKEN_EXPIRATION_SECONDS = 7 * 24 * 60 * 60;
export const publicRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
];
export const QUEUE_MESSAGE_RETRY_LIMIT = 3;
export const REDIS_EXPIRY_TIME = 60; // in seconds

// Centralized API configuration supporting local development and production deployments (Vercel, Render, etc.)
export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

export const API_AUTH = `${BASE_URL}/api/auth`;
export const API_BOOKS = `${BASE_URL}/api/books`;
export const API_AI = `${BASE_URL}/api/ai`;
export const API_PAYMENT = `${BASE_URL}/api/payment`;
export const API_ANALYTICS = `${BASE_URL}/api/analytics`;
export const API_ADMIN = `${BASE_URL}/api/admin`;

export default {
  BASE_URL,
  API_AUTH,
  API_BOOKS,
  API_AI,
  API_PAYMENT,
  API_ANALYTICS,
  API_ADMIN,
};

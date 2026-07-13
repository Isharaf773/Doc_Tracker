const fallbackApiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8080'
  : '';

export const API_BASE = import.meta.env.VITE_API_BASE || fallbackApiBase;

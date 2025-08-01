import { environment } from '../../environments/environment';

let apiUrl = environment.apiUrl;
const win = typeof window !== 'undefined' ? (window as unknown) : undefined;

// Override with runtime environment if available
if (win && typeof (win as { ENV?: { apiUrl?: string } }).ENV?.apiUrl === 'string') {
  apiUrl = (win as { ENV: { apiUrl: string } }).ENV.apiUrl;
} else if (win && typeof (win as { location?: { hostname: string } }).location?.hostname === 'string') {
  // Auto-detect API URL based on current domain
  const hostname = (win as { location: { hostname: string } }).location.hostname;
  if (hostname.startsWith('app.')) {
    // If we're on app subdomain, API should be on api subdomain
    apiUrl = `http://${hostname.replace('app.', 'api.')}`;
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development
    apiUrl = 'http://localhost:3000';
  }
}

export const API_BASE_URL = apiUrl; 
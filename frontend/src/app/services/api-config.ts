let apiUrl = 'http://localhost:3000';
const win = typeof window !== 'undefined' ? (window as unknown) : undefined;
if (win && typeof (win as { ENV?: { apiUrl?: string } }).ENV?.apiUrl === 'string') {
  apiUrl = (win as { ENV: { apiUrl: string } }).ENV.apiUrl;
}
export const API_BASE_URL = apiUrl; 
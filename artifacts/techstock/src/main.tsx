import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// In production (Vercel), API is served from the same domain at /api
// In development, point to the local API server
if (import.meta.env.DEV) {
  setBaseUrl('http://localhost:3000');
}

createRoot(document.getElementById('root')!).render(<App />);

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
if (import.meta.env.DEV) {
  (window as any).__BACKEND__ = import.meta.env.VITE_BACKEND_BASE;
}
createRoot(document.getElementById("root")!).render(<App />);

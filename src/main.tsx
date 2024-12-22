import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Application initialization starting");
console.log("Current URL:", window.location.href);
console.log("Current pathname:", window.location.pathname);

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("Application mounted successfully");
  console.log("Environment:", import.meta.env.MODE);
} else {
  console.error("Failed to find root element");
}
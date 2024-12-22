import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("=== Application Initialization ===");
console.log("Environment:", import.meta.env.MODE);
console.log("Base URL:", import.meta.env.BASE_URL);
console.log("Current URL:", window.location.href);
console.log("Current pathname:", window.location.pathname);
console.log("Current search params:", window.location.search);
console.log("Current hash:", window.location.hash);
console.log("User Agent:", navigator.userAgent);

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("✅ Application mounted successfully");
  console.log("=== Initialization Complete ===");
} else {
  console.error("❌ Failed to find root element");
}
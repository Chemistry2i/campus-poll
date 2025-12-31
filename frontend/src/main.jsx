import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Accessibility provider and global settings panel
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'
import AccessibilitySettingsPanel from './components/accessibility/AccessibilitySettingsPanel.jsx'

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

createRoot(document.getElementById('root')).render(
  <AccessibilityProvider>
    <App />
    {/* Global accessibility settings toggle (fixed position) */}
    <AccessibilitySettingsPanel />
  </AccessibilityProvider>
)

// Register Service Worker for PWA and offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
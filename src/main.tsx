import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './index.css';
import App from './App';
import { validateEnvironment, config } from './config/environment';

import { registerPWA } from './utils/pwa';

// Validate environment variables before starting
validateEnvironment();

console.log(`🌅 ${config.appName} v${config.appVersion}`);
if (config.debugMode) {
  console.log('🔧 Debug mode enabled');
}

// Register PWA service worker
registerPWA();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const theme = createTheme({
  palette: {
    background: {
      default: '#f8fafc',
    },
    text: {
      primary: '#0f172a',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
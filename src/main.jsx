import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import './index.css'
import App from './App.jsx'
import { validateEnvironment, config } from './config/environment.js'

// Validar variables de entorno antes de iniciar
validateEnvironment()

console.log(`🌅 ${config.appName} v${config.appVersion}`)
if (config.debugMode) {
  console.log('🔧 Debug mode enabled')
}

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
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)

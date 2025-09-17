// Main entry point for React application
// Sets up React app with theme provider and routing
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './i18n';
import './styles/globals.css';

// Create Material-UI theme with custom colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // Blue color matching the design
      light: '#64b5f6',
      dark: '#1976d2'
    },
    secondary: {
      main: '#4caf50', // Green accent
      light: '#81c784',
      dark: '#388e3c'
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1a237e'
    },
    h5: {
      fontWeight: 500,
      color: '#1a237e'
    }
  },
  shape: {
    borderRadius: 12
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with providers for routing, theming, and authentication
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5', 
      light: '#757de8',
      dark: '#002984',
    },
    secondary: {
      main: '#f50057', 
    },
    background: {
      default: '#0f172a', 
      paper: '#1e293b',  
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #020617 0%, #115e59 40%, #7c3aed 100%)',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
        },
        'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, textarea:-webkit-autofill, select:-webkit-autofill': {
          WebkitTextFillColor: '#fff',
          transition: 'background-color 9999s ease-in-out 0s',
          boxShadow: '0 0 0px 1000px rgba(255,255,255,0.03) inset',
          borderRadius: '8px',
        },
        '.MuiOutlinedInput-root': {
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          '&:hover fieldset': {
            borderColor: 'rgba(255,255,255,0.2)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#7c3aed',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

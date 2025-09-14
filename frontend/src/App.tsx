import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TouristsPage from './pages/TouristsPage';
import AlertsPage from './pages/AlertsPage';
import MapsPage from './pages/MapsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Theme
import { lightTheme, darkTheme } from './theme/theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  
  const theme = React.useMemo(
    () => createTheme(isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              <Router>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected Routes */}
                    <Route
                      path="/*"
                      element={
                        <ProtectedRoute>
                          <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                            <Routes>
                              <Route path="/" element={<Navigate to="/dashboard" replace />} />
                              <Route path="/dashboard" element={<DashboardPage />} />
                              <Route path="/tourists" element={<TouristsPage />} />
                              <Route path="/alerts" element={<AlertsPage />} />
                              <Route path="/maps" element={<MapsPage />} />
                              <Route path="/analytics" element={<AnalyticsPage />} />
                              <Route path="/settings" element={<SettingsPage />} />
                            </Routes>
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Box>
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`,
                    },
                    success: {
                      iconTheme: {
                        primary: theme.palette.success.main,
                        secondary: theme.palette.success.contrastText,
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: theme.palette.error.main,
                        secondary: theme.palette.error.contrastText,
                      },
                    },
                  }}
                />
              </Router>
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

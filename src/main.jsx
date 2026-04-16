import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { useAppStore, useSettingsStore } from './stores'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import './styles/scifi-theme.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function buildTheme(customTheme) {
  return createTheme({
    primaryColor: 'cyan',
    colors: {
      cyan: ['#e3fafc','#c5f6fa','#99e9f2','#66d9e8','#3bc9db','#22b8cf','#15aabf','#1098ad','#0c8599','#0b7285'],
    },
    primaryShade: 5,
    defaultRadius: customTheme?.radius || 'md',
    fontFamily: customTheme?.fontFamily || 'system-ui, -apple-system, sans-serif',
    components: {
      Button: {
        defaultProps: {
          color: customTheme?.primaryColor || 'cyan'
        }
      }
    }
  })
}

function Root() {
  const colorScheme = useAppStore((s) => s.colorScheme);
  const customTheme = useSettingsStore((s) => s.customTheme);
  const theme = buildTheme(customTheme);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} forceColorScheme={colorScheme}>
          <Notifications position="top-right" />
          <App />
        </MantineProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)

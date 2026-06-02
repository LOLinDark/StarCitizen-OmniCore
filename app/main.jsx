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

console.log('[OmniCore] 1. main.jsx loaded');
console.log('[OmniCore] BASE_URL:', import.meta.env.BASE_URL);
console.log('[OmniCore] MODE:', import.meta.env.MODE);

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
      dark: ['#c1d0e0','#a3b8cc','#6b7f96','#3a5060','#1a2a3e','#0f1b2e','#0a1428','#071020','#050c18','#030810'],
    },
    primaryShade: 5,
    defaultRadius: customTheme?.radius || 'sm',
    fontFamily: customTheme?.fontFamily || '"Inter", system-ui, -apple-system, sans-serif',
    headings: {
      fontFamily: '"Orbitron", "Inter", system-ui, sans-serif',
    },
    components: {
      Button: {
        defaultProps: {
          color: customTheme?.primaryColor || 'cyan',
        },
        styles: { root: { minHeight: '44px', minWidth: '44px' } },
      },
      ActionIcon: {
        styles: { root: { minHeight: '44px', minWidth: '44px' } },
      },
    },
  })
}

function Root() {
  console.log('[OmniCore] 2. Root component rendering');
  const colorScheme = useAppStore((s) => s.colorScheme);
  const customTheme = useSettingsStore((s) => s.customTheme);
  const theme = buildTheme(customTheme);
  console.log('[OmniCore] 3. Stores loaded, colorScheme:', colorScheme);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} forceColorScheme={colorScheme}>
          <Notifications position="top-right" />
          <App />
        </MantineProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

const root = document.getElementById('root');
if (!root) {
  console.error('[OmniCore] ERROR: Root element not found!');
} else {
  console.log('[OmniCore] 0. DOM root element found, mounting React');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>,
  )
}

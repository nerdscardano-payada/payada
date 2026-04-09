import React from 'react'
import ReactDOM from 'react-dom/client'
import { CardanoWalletProvider } from '@cardano-foundation/cardano-connect-with-wallet'
import App from '@/App.jsx'
import ThemeProvider from '@/components/theme/ThemeProvider'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <CardanoWalletProvider>
      <App />
    </CardanoWalletProvider>
  </ThemeProvider>
)
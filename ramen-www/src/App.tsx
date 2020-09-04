import React from 'react'
import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'

import ProposalsProvider from './contexts/Proposals'
import KitchensProvider from './contexts/Kitchens'
import ModalsProvider from './contexts/Modals'
import RamenProvider from './contexts/RamenProvider'
import TransactionProvider from './contexts/Transactions'

import Kitchens from './views/Kitchens'
import Vote from './views/Vote'
import Home from './views/Home'
import Statics from './views/Statics'
import theme from './theme'

const App: React.FC = () => {
  return (
    <Providers>
      <Router>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/farms">
            <Kitchens />
          </Route>
          <Route path="/vote">
            <Vote />
          </Route>
          <Route path="/stats">
            <Statics />
          </Route>
        </Switch>
      </Router>
    </Providers>
  )
}

const Providers: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <UseWalletProvider
        chainId={1}
        connectors={{
          walletconnect: { rpcUrl: 'https://mainnet.eth.aragon.network/' },
        }}
      >
        <RamenProvider>
          <TransactionProvider>
            <ModalsProvider>
              <KitchensProvider>
                <ProposalsProvider>
                  {children}
                </ProposalsProvider>
              </KitchensProvider>
            </ModalsProvider>
          </TransactionProvider>
        </RamenProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

export default App

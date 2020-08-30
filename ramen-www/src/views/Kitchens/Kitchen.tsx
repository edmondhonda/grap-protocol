import React from 'react'
import {
  Route,
  Switch,
  useRouteMatch,
} from 'react-router-dom'
import { useWallet } from 'use-wallet'

import farmer from '../../assets/img/farmer.png'

import Button from '../../components/Button'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import Kitchen from '../Kitchen'

import KitchenCards from './components/KitchenCards'

const Kitchens: React.FC = () => {
  const { path } = useRouteMatch()
  const { account, connect } = useWallet()
  return (
    <Switch>
      <Page>
      {!!account ? (
        <>
          <Route exact path={path}>
            <PageHeader
              icon={<img src={farmer} height="125" />}
              subtitle="Earn Ramen tokens by providing liquidity."
              title="Select a Kitchen."
            />
            <KitchenCards />
          </Route>
          <Route path={`${path}/:farmId`}>
            <Kitchen />
          </Route>
        </>
      ) : (
        <div style={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
        }}>
          <Button
            onClick={() => connect('injected')}
            text="Unlock Wallet"
          />
        </div>
      )}
      </Page>
    </Switch>
  )
}


export default Kitchens
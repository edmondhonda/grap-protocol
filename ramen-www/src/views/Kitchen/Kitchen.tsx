import React, { useMemo, useEffect } from 'react'
import styled from 'styled-components'

import { useParams } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import Countdown, { CountdownRenderProps} from 'react-countdown'


import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import Spacer from '../../components/Spacer'

import useKitchen from '../../hooks/useKitchen'
import useRedeem from '../../hooks/useRedeem'
import { getContract } from '../../utils/erc20'

import Harvest from './components/Harvest'
import Stake from './components/Stake'

const Kitchen: React.FC = () => {
  const { farmId } = useParams()
  const {
    contract,
    depositToken,
    depositTokenAddress,
    earnToken,
    name,
    icon,
  } = useKitchen(farmId) || {
    depositToken: '',
    depositTokenAddress: '',
    earnToken: '',
    name: '',
    icon: ''
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  const { ethereum } = useWallet()

  const tokenContract = useMemo(() => {
    return getContract(ethereum as provider, depositTokenAddress)
  }, [ethereum, depositTokenAddress])

  const { onRedeem } = useRedeem(contract)

  const depositTokenName = useMemo(() => {
    return depositToken.toUpperCase()
  }, [depositToken])

  const earnTokenName = useMemo(() => {
    return earnToken.toUpperCase()
  }, [earnToken])

  const countdownBlock = () => {
    const date = Date.parse('Sun Aug 23 2020 00:20:00 GMT+0800')
    if (Date.now() >= date) return "";
    return (
      <CountdownView>
        <Countdown date={date} />
      </CountdownView>
    )
  }

  const YamNotify = (token: String)=> {
    if (token != "yam") return ""
    return (
      <YamNotifyView>
        <p> Kitchen is good, but don't forget migration your YAM before Migration Deadline. </p>
        <p>
          <a href='https://yam.finance/'>https://yam.finance/</a>
        </p>
        {countdownBlock()}
      </YamNotifyView>
    )
  }

  const lpPoolTips = (token: String)=> {
    if (token != 'uni_lp') return ""
    return (
      <YamNotifyView>
        <p>
          If you want Add liquidity to Uniswap, please use this <a href='https://app.uniswap.org/#/add/0x514910771af9ca656af840dff83e8264ecf986/0xa76552b40e0ae344002193e360f89db4a87db7cb'>Uniswap link</a>.
        </p>
      </YamNotifyView>
    )
  }


  return (
    <>
      <PageHeader
        icon={icon}
        subtitle={`Deposit ${depositTokenName} and earn ${earnTokenName}`}
        title={name}
      />
      {YamNotify(depositToken)}
      <StyledKitchen>
        {
          lpPoolTips(depositToken)
        }
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <Harvest poolContract={contract} />
          </StyledCardWrapper>
          <Spacer />
          <StyledCardWrapper>
            <Stake
              poolContract={contract}
              tokenContract={tokenContract}
              tokenName={depositToken.toUpperCase()}
            />
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="lg" />
        <div>
          <Button
            onClick={onRedeem}
            text="Harvest & Withdraw"
          />
        </div>
        <Spacer size="lg" />
      </StyledKitchen>
    </>
  )
}

const StyledKitchen = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`

const CountdownView =  styled.div`
  font-size: 30px;
  font-weight: bold;
  color: rgb(209, 0, 75);
  margin-bottom: 20px;
`

const YamNotifyView =  styled.div`
  text-align: center;
  color: #555;
`


export default Kitchen

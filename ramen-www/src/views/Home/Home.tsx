import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Countdown from 'react-countdown';


import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'

import useRamen from '../../hooks/useRamen'

import Rebase from './components/Rebase'
import Stats from './components/Stats'

import { OverviewData } from './types'
import { getStats } from './utils'

const Home: React.FC = () => {

  const ramen = useRamen()
  const [{
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply,
  }, setStats] = useState<OverviewData>({})

  const fetchStats = useCallback(async () => {
    const statsData = await getStats(ramen)
    setStats(statsData)
  }, [ramen, setStats])

  useEffect(() => {
    if (ramen) {
      fetchStats()
    }
  }, [ramen])

  const countdownBlock = () => {
    const date = Date.parse("2020-08-20T00:00:00+0000");
    if (Date.now() >= date) return "";
    return (
      <CountdownView>
        <Countdown date={date} />
      </CountdownView>
    )
  }

  return (
    <Page>
      {countdownBlock()}

      <PageHeader icon="🍲" subtitle="Ramen: 10% noodles, 90% love!!!" title="Welcome" />

      <StyledOverview>
        <Rebase nextRebase={nextRebase} />
        <StyledSpacer />
        <Stats
          circSupply={circSupply}
          curPrice={curPrice}
          targetPrice={targetPrice}
          totalSupply={totalSupply}
        />
      </StyledOverview>
    </Page>
  )
}

const StyledOverview = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
  }
`

const CountdownView =  styled.div`
  font-size: 30px;
  font-weight: bold;
  color: #555;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

export default Home

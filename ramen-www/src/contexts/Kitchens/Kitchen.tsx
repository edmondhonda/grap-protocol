import React, { useCallback, useEffect, useState } from 'react'

import { Contract } from "web3-eth-contract"

import { ramen as ramenAddress } from '../../constants/tokenAddresses'
import useRamen from '../../hooks/useRamen'
import { getPoolContracts } from '../../ramenUtils'

import Context from './context'
import { Kitchen } from './types'

const NAME_FOR_POOL: { [key: string]: string } = {
  eth_pool: 'Weth Homestead',
  sushi_pool: 'Sushi',
  crv_pool: 'Curvy Fields',
  yfi_pool: 'YFI Kitchen',
  based_pool: 'BASED Kitchen',
  comp_pool: 'Compounding Hills',
  link_pool: 'Marine Gardens',
  lend_pool: 'Aave Agriculture',
  snx_pool: 'Spartan Grounds',
  mkr_pool: 'Maker Range',
  ycrvUNIV_pool: 'Eternal Lands',
}

const ICON_FOR_POOL: { [key: string]: string } = {
  yfi_pool: '🐋',
  based_pool: '🦈',
  sushi_pool: '🍣',
  eth_pool: '🌎',
  crv_pool: '🚜',
  comp_pool: '🍲',
  link_pool: '🔗',
  lend_pool: '🏕️',
  snx_pool: '⚔️',
  mkr_pool: '🐮',
  ycrvUNIV_pool: '🌈',
}

const Kitchens: React.FC = ({ children }) => {

  const [farms, setKitchens] = useState<Kitchen[]>([])
  const ramen = useRamen()

  const fetchPools = useCallback(async () => {
    const pools: { [key: string]: Contract} = await getPoolContracts(ramen)

    const farmsArr: Kitchen[] = []
    const poolKeys = Object.keys(pools)

    for (let i = 0; i < poolKeys.length; i++) {
      const poolKey = poolKeys[i]
      const pool = pools[poolKey]
      let tokenKey = poolKey.replace('_pool', '')
      if (tokenKey === 'eth') {
        tokenKey = 'weth'
      } else if (tokenKey === 'ycrvUNIV') {
        tokenKey = 'uni_lp'
      }

      const method = pool.methods[tokenKey]
      if (method) {
        try {
          let tokenAddress = ''
          if (tokenKey === 'uni_lp') {
            tokenAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA'
          } else {
            tokenAddress = await method().call()
          }
          farmsArr.push({
            contract: pool,
            name: NAME_FOR_POOL[poolKey],
            depositToken: tokenKey,
            depositTokenAddress: tokenAddress,
            earnToken: 'ramen',
            earnTokenAddress: ramenAddress,
            icon: ICON_FOR_POOL[poolKey],
            id: tokenKey
          })
        } catch (e) {
          console.log(e)
        }
      }
    }
    setKitchens(farmsArr)
  }, [ramen, setKitchens])

  useEffect(() => {
    if (ramen) {
      fetchPools()
    }
  }, [ramen, fetchPools])

  return (
    <Context.Provider value={{ farms }}>
      {children}
    </Context.Provider>
  )
}

export default Kitchens

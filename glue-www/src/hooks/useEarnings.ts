import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from "web3-eth-contract"

import { getEarned } from '../glueUtils'
import useGlue from './useGlue'

const useEarnings = (pool: Contract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const glue = useGlue()

  const fetchBalance = useCallback(async () => {
    const balance = await getEarned(glue, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, glue])

  useEffect(() => {
    if (account && pool && glue) {
      fetchBalance()
    }
  }, [account, pool, setBalance, glue])

  return balance
}

export default useEarnings
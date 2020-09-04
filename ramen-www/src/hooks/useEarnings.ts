import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from "web3-eth-contract"

import { getEarned } from '../ramenUtils'
import useRamen from './useRamen'

const useEarnings = (pool: Contract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const ramen = useRamen()

  const fetchBalance = useCallback(async () => {
    const balance = await getEarned(ramen, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, ramen])

  useEffect(() => {
    if (account && pool && ramen) {
      fetchBalance()
    }
  }, [account, pool, setBalance, ramen])

  return balance
}

export default useEarnings
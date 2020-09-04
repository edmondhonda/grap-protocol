import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from "web3-eth-contract"

import { getStaked } from '../ramenUtils'
import useRamen from './useRamen'

const useStakedBalance = (pool: Contract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const ramen = useRamen()

  const fetchBalance = useCallback(async () => {
    const balance = await getStaked(ramen, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, ramen])

  useEffect(() => {
    if (account && pool && ramen) {
      fetchBalance()
    }
  }, [account, pool, setBalance, ramen])

  return balance
}

export default useStakedBalance
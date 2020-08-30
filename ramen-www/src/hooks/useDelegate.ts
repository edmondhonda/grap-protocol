import { useCallback } from 'react'

import { useWallet } from 'use-wallet'

import { delegate } from '../ramenUtils'
import useRamen from './useRamen'

const useDelegate = (address?: string) => {
  const { account } = useWallet()
  const ramen = useRamen()

  const handleDelegate = useCallback(async () => {
    const txHash = await delegate(ramen ,address || account, account)
    console.log(txHash)
  }, [account, address])

  return { onDelegate: handleDelegate }
}

export default useDelegate
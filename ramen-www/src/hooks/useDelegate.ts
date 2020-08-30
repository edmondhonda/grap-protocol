import { useCallback } from 'react'

import { useWallet } from 'use-wallet'

import { delegate } from '../ramenUtils'
import useGlue from './useRamen'

const useDelegate = (address?: string) => {
  const { account } = useWallet()
  const glue = useGlue()

  const handleDelegate = useCallback(async () => {
    const txHash = await delegate(glue ,address || account, account)
    console.log(txHash)
  }, [account, address])

  return { onDelegate: handleDelegate }
}

export default useDelegate
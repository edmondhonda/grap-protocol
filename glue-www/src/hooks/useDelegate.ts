import { useCallback } from 'react'

import { useWallet } from 'use-wallet'

import { delegate } from '../glueUtils'
import useGlue from './useGlue'

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
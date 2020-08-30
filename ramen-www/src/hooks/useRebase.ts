import { useCallback } from 'react'

import { useWallet } from 'use-wallet'
import { Glue } from '../ramen'
import { rebase } from '../ramenUtils'

import useGlue from './useRamen'

const useRebase = () => {
  const { account } = useWallet()
  const glue = useGlue()

  const handleRebase = useCallback(async () => {
    const txHash = await rebase(glue, account)
    console.log(txHash)
  }, [account, glue])

  return { onRebase: handleRebase }
}

export default useRebase
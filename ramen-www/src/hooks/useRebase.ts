import { useCallback } from 'react'

import { useWallet } from 'use-wallet'
import { Ramen } from '../ramen'
import { rebase } from '../ramenUtils'

import useRamen from './useRamen'

const useRebase = () => {
  const { account } = useWallet()
  const ramen = useRamen()

  const handleRebase = useCallback(async () => {
    const txHash = await rebase(ramen, account)
    console.log(txHash)
  }, [account, ramen])

  return { onRebase: handleRebase }
}

export default useRebase
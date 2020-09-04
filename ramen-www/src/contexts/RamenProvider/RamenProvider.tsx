import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Ramen } from '../../ramen'

export interface RamenContext {
  ramen?: typeof Ramen
}

export const Context = createContext<RamenContext>({
  ramen: undefined,
})

declare global {
  interface Window {
    ramensauce: any
  }
}

const RamenProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [ramen, setRamen] = useState<any>()

  useEffect(() => {
    if (ethereum) {
      const ramenLib = new Ramen(
        ethereum,
        "1",
        false, {
          defaultAccount: "",
          defaultConfirmations: 1,
          autoGasMultiplier: 1.5,
          testing: false,
          defaultGas: "6000000",
          defaultGasPrice: "1000000000000",
          accounts: [],
          ethereumNodeTimeout: 10000
        }
      )
      setRamen(ramenLib)
      window.ramensauce = ramenLib
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ ramen }}>
      {children}
    </Context.Provider>
  )
}

export default RamenProvider

import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Glue } from '../../glue'

export interface GlueContext {
  glue?: typeof Glue
}

export const Context = createContext<GlueContext>({
  glue: undefined,
})

declare global {
  interface Window {
    gluesauce: any
  }
}

const GlueProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [glue, setGlue] = useState<any>()

  useEffect(() => {
    if (ethereum) {
      const glueLib = new Glue(
        ethereum,
        "42",
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
      setGlue(glueLib)
      window.gluesauce = glueLib
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ glue }}>
      {children}
    </Context.Provider>
  )
}

export default GlueProvider

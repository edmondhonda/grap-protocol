import { Contract } from "web3-eth-contract"

export interface Kitchen {
  contract: Contract,
  name: string,
  depositToken: string,
  depositTokenAddress: string,
  earnToken: string,
  earnTokenAddress: string,
  icon: React.ReactNode,
  id: string,
}

export interface KitchensContext {
  farms: Kitchen[]
}
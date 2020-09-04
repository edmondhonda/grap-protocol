import { Ramen } from '../../ramen'

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
} from '../../ramenUtils'

const getCurrentPrice = async (ramen: typeof Ramen): Promise<number> => {
  // FORBROCK: get current RAMEN price
  return gCP(ramen)
}

const getTargetPrice = async (ramen: typeof Ramen): Promise<number> => {
  // FORBROCK: get target RAMEN price
  return gTP(ramen)
}

const getCirculatingSupply = async (ramen: typeof Ramen): Promise<string> => {
  // FORBROCK: get circulating supply
  return gCS(ramen)
}

const getNextRebaseTimestamp = async (ramen: typeof Ramen): Promise<number> => {
  // FORBROCK: get next rebase timestamp
  const nextRebase = await gNRT(ramen) as number
  return nextRebase * 1000
}

const getTotalSupply = async (ramen: typeof Ramen): Promise<string> => {
  // FORBROCK: get total supply
  return gTS(ramen)
}

export const getStats = async (ramen: typeof Ramen) => {
  const curPrice = await getCurrentPrice(ramen)
  const circSupply = await getCirculatingSupply(ramen)
  const nextRebase = await getNextRebaseTimestamp(ramen)
  const targetPrice = await getTargetPrice(ramen)
  const totalSupply = await getTotalSupply(ramen)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}

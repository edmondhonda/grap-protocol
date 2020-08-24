import { Glue } from '../../glue'

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
} from '../../glueUtils'

const getCurrentPrice = async (glue: typeof Glue): Promise<number> => {
  // FORBROCK: get current GLUE price
  return gCP(glue)
}

const getTargetPrice = async (glue: typeof Glue): Promise<number> => {
  // FORBROCK: get target GLUE price
  return gTP(glue)
}

const getCirculatingSupply = async (glue: typeof Glue): Promise<string> => {
  // FORBROCK: get circulating supply
  return gCS(glue)
}

const getNextRebaseTimestamp = async (glue: typeof Glue): Promise<number> => {
  // FORBROCK: get next rebase timestamp
  const nextRebase = await gNRT(glue) as number
  return nextRebase * 1000
}

const getTotalSupply = async (glue: typeof Glue): Promise<string> => {
  // FORBROCK: get total supply
  return gTS(glue)
}

export const getStats = async (glue: typeof Glue) => {
  const curPrice = await getCurrentPrice(glue)
  const circSupply = await getCirculatingSupply(glue)
  const nextRebase = await getNextRebaseTimestamp(glue)
  const targetPrice = await getTargetPrice(glue)
  const totalSupply = await getTotalSupply(glue)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}

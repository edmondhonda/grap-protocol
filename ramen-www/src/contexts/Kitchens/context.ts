import { createContext } from 'react'
import { KitchensContext } from './types'

const context = createContext<KitchensContext>({
  farms: []
})

export default context
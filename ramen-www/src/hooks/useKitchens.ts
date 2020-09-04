import { useContext } from 'react'
import { Context as KitchensContext } from '../contexts/Kitchens'

const useKitchens = () => {
  const { farms } = useContext(KitchensContext)
  return [farms]
}

export default useKitchens
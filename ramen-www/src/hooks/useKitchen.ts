import { useContext } from 'react'
import { Context as KitchensContext, Kitchen } from '../contexts/Kitchens'

const useKitchen = (id: string): Kitchen => {
  const { farms } = useContext(KitchensContext)
  const farm = farms.find(farm => farm.id === id)
  return farm
}

export default useKitchen
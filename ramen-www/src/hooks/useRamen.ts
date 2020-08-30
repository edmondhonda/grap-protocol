import { useContext } from 'react'
import { Context } from '../contexts/RamenProvider'

const useRamen = () => {
  const { ramen } = useContext(Context)
  return ramen
}

export default useRamen
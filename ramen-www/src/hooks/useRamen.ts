import { useContext } from 'react'
import { Context } from '../contexts/RamenProvider'

const useGlue = () => {
  const { glue } = useContext(Context)
  return glue
}

export default useGlue
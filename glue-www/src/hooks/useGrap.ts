import { useContext } from 'react'
import { Context } from '../contexts/GlueProvider'

const useGlue = () => {
  const { glue } = useContext(Context)
  return glue
}

export default useGlue
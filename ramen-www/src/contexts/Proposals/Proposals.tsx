import React, { useCallback, useEffect, useState } from 'react'

import useGlue from '../../hooks/useRamen'
import { getProposals } from '../../ramenUtils'

import Context from './context'
import { Proposal } from './types'


const Proposals: React.FC = ({ children }) => {

  const [proposals, setProposals] = useState<Proposal[]>([])
  const glue = useGlue()
  
  const fetchProposals = useCallback(async () => {
    const propsArr: Proposal[] = await getProposals(glue)

    setProposals(propsArr)
  }, [glue, setProposals])

  useEffect(() => {
    if (glue) {
      fetchProposals()
    }
  }, [glue, fetchProposals])

  return (
    <Context.Provider value={{ proposals }}>
      {children}
    </Context.Provider>
  )
}

export default Proposals

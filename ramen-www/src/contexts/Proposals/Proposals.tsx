import React, { useCallback, useEffect, useState } from 'react'

import useRamen from '../../hooks/useRamen'
import { getProposals } from '../../ramenUtils'

import Context from './context'
import { Proposal } from './types'


const Proposals: React.FC = ({ children }) => {

  const [proposals, setProposals] = useState<Proposal[]>([])
  const ramen = useRamen()
  
  const fetchProposals = useCallback(async () => {
    const propsArr: Proposal[] = await getProposals(ramen)

    setProposals(propsArr)
  }, [ramen, setProposals])

  useEffect(() => {
    if (ramen) {
      fetchProposals()
    }
  }, [ramen, fetchProposals])

  return (
    <Context.Provider value={{ proposals }}>
      {children}
    </Context.Provider>
  )
}

export default Proposals

import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink href="https://github.com/Sumo-Finance/">Github</StyledLink>
      <StyledLink href="https://twitter.com/SumoFinance">Twitter</StyledLink>
      <StyledLink href="https://discord.gg/FbDc6cN">Discord</StyledLink>
      <StyledLink href="https://www.bitmex.com">King Arthur's Lair</StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`

const StyledLink = styled.a`
  color: ${props => props.theme.color.grey[400]};
  padding-left: ${props => props.theme.spacing[3]}px;
  padding-right: ${props => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${props => props.theme.color.grey[500]};
  }
`

export default Nav

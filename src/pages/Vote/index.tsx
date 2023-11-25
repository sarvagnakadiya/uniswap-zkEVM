import React from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { TYPE, ExternalLink } from '../../theme'
import { RowBetween } from '../../components/Row'
import { Link } from 'react-router-dom'
import { ProposalStatus } from './styled'
import { Button } from 'rebass/styled-components'
import { darken } from 'polished'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { useUserDelegatee } from '../../state/governance/hooks'
import DelegateModal from '../../components/vote/DelegateModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { UNI, ZERO_ADDRESS } from '../../constants'
import { JSBI, TokenAmount } from '@uniswap/sdk'
import { useModalOpen, useToggleDelegateModal } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/actions'

const PageWrapper = styled(AutoColumn)``

const TopSection = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const Proposal = styled(Button)`
  padding: 0.75rem 1rem;
  width: 100%;
  margin-top: 1rem;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  align-items: center;
  text-align: left;
  outline: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  text-decoration: none;
  background-color: ${({ theme }) => theme.bg1};
  &:focus {
    background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  }
`

const ProposalNumber = styled.span`
  opacity: 0.6;
`

const ProposalTitle = styled.span`
  font-weight: 600;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const WrapSmall = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
  
  `};
`

export default function Vote() {
  const { account, chainId } = useActiveWeb3React()

  // toggle for showing delegation modal
  const showDelegateModal = useModalOpen(ApplicationModal.DELEGATE)
  const toggleDelegateModal = useToggleDelegateModal()

  // user data
  const uniBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, chainId ? UNI[chainId] : undefined)
  const userDelegatee: string | undefined = useUserDelegatee()

  // show delegation option if they have have a balance, but have not delegated
  const showUnlockVoting = Boolean(
    uniBalance && JSBI.notEqual(uniBalance.raw, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS
  )

  return (
    <PageWrapper gap="lg" justify="center">
      <DelegateModal
        isOpen={showDelegateModal}
        onDismiss={toggleDelegateModal}
        title={showUnlockVoting ? 'Unlock Votes' : 'Update Delegation'}
      />
      <TopSection gap="md">
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Uniswap Governance</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  UNI tokens represent voting shares in Uniswap governance. You can vote on each proposal yourself or
                  delegate your votes to a third party.
                </TYPE.white>
              </RowBetween>
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                href="https://uniswap.org/blog/uni"
                target="_blank"
              >
                <TYPE.white fontSize={14}>Read more about Uniswap governance</TYPE.white>
              </ExternalLink>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      </TopSection>
      <TopSection gap="2px">
        <WrapSmall>
          <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Proposals</TYPE.mediumHeader>
        </WrapSmall>
        <Proposal as={Link} to={'/vote/' + 1} key={1}>
          <ProposalNumber>1</ProposalNumber>
          <ProposalTitle>Deploy Uniswap V3 on Scroll</ProposalTitle>
          <ProposalStatus status="active">ACTIVE</ProposalStatus>
        </Proposal>
      </TopSection>
      <TYPE.subHeader color="text3">
        A minimum threshhold of 1% of the total UNI supply is required to submit proposals
      </TYPE.subHeader>
    </PageWrapper>
  )
}

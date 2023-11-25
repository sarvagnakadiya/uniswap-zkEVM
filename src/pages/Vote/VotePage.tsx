import React, { useEffect, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'

import { RouteComponentProps } from 'react-router-dom'
import { TYPE, StyledInternalLink, ExternalLink } from '../../theme'
import { RowFixed, RowBetween } from '../../components/Row'
import { CardSection, DataCard } from '../../components/earn/styled'
import { ArrowLeft } from 'react-feather'
import { ButtonPrimary } from '../../components/Button'
import { ProposalStatus } from './styled'
import ReactMarkdown from 'react-markdown'
import VoteModal from '../../components/vote/VoteModal'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleVoteModal } from '../../state/application/hooks'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
import governorAlphaAbi from '../../artifacts/GovernorAlpha.json'
import l2ContractAbi from '../../artifacts/L2Contract.json'
import uniAbi from '../../artifacts/Uni.json'
const governorAlphaContractAddress = '0xF5c88c7f5586449883aC010edC633df9174ef1FB'
const l2ContractAddress = '0x1d1EFA4cA285cd86D3520a644e79c8984B9cC931'
const uniContractAddress = '0x93C81F9d6f8A7AF47280756C61684fcD9C32cDDe'
dotenv.config()
const PageWrapper = styled(AutoColumn)`
  width: 100%;
`

const ProposalInfo = styled(AutoColumn)`
  border: 1px solid ${({ theme }) => theme.bg4};
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  max-width: 640px;
  width: 100%;
`
const ArrowWrapper = styled(StyledInternalLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  color: ${({ theme }) => theme.text1};

  a {
    color: ${({ theme }) => theme.text1};
    text-decoration: none;
  }
  :hover {
    text-decoration: none;
  }
`
const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
`

const StyledDataCard = styled(DataCard)`
  width: 100%;
  background: none;
  background-color: ${({ theme }) => theme.bg1};
  height: fit-content;
  z-index: 2;
`

const WrapSmall = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-start;
    flex-direction: column;
  `};
`

const ProposerAddressLink = styled(ExternalLink)`
  word-break: break-all;
`

export default function VotePage({
  match: {
    params: { id }
  }
}: RouteComponentProps<{ id: string }>) {
  const [voteFor, setVoteFor] = useState<any>()
  const [voteAgainst, setVoteAgainst] = useState<any>()
  const [proposalInfo, setProposalInfo] = useState<any>()

  // modal for casting votes
  const showVoteModal = useModalOpen(ApplicationModal.VOTE)
  const toggleVoteModal = useToggleVoteModal()

  const getProposal = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC)

        const contract = new ethers.Contract(governorAlphaContractAddress, governorAlphaAbi.abi, provider)

        const proposal = await contract.proposals(1)
        console.log('----------------------------------------------')
        console.log(proposal)
        setVoteFor(ethers.utils.formatEther(BigInt(proposal.forVotes)))
        setVoteAgainst(ethers.utils.formatEther(BigInt(proposal.againstVotes)))
        setProposalInfo(proposal)
        // }
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getProposal()
  }, [])

  const votePositive = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        console.log(address)
        const { chainId } = await provider.getNetwork()
        console.log(chainId)
        if (chainId === 1442) {
          const contract = new ethers.Contract(l2ContractAddress, l2ContractAbi.abi, signer)
          const iface = new ethers.utils.Interface(governorAlphaAbi.abi)
          console.log(iface)
          const calldata = iface.encodeFunctionData('castVote', [address, 1, true])
          console.log(calldata)
          console.log(contract)
          const tx = await contract.sendMessageToL1(governorAlphaContractAddress, calldata)
          console.log(`sent tx hash ${tx.hash}`)
          console.log(`https://testnet-zkevm.polygonscan.com/tx/${tx.hash}`)
        } else {
          alert('Please connect to the Polygon zkEVM testnet!')
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const voteNegative = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        console.log(address)
        const { chainId } = await provider.getNetwork()
        console.log(chainId)
        if (chainId === 1442) {
          const contract = new ethers.Contract(l2ContractAddress, l2ContractAbi.abi, signer)
          const iface = new ethers.utils.Interface(governorAlphaAbi.abi)
          console.log(iface)
          const calldata = iface.encodeFunctionData('castVote', [address, 1, false])
          console.log(calldata)
          console.log(contract)
          const tx = await contract.sendMessageToL1(governorAlphaContractAddress, calldata)
          console.log(`sent tx hash ${tx.hash}`)
          console.log(`https://testnet-zkevm.polygonscan.com/tx/${tx.hash}`)
        } else {
          alert('Please connect to the Polygon zkEVM testnet!')
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const delegate = async () => {
    const pkey = process.env.REACT_APP_KEY || ''
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        console.log(address)
        const { chainId } = await provider.getNetwork()
        console.log(chainId)
        if (chainId === 1442) {
          const wallet = new ethers.Wallet(pkey, provider)
          const uniContract = new ethers.Contract(uniContractAddress, uniAbi.abi, wallet)
          const delegate = await uniContract.delegate(address)
          console.log('delegating...')
          await delegate.wait()
          console.log('delegated')
        } else {
          alert('Please connect to the Polygon zkEVM testnet!')
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <PageWrapper gap="lg" justify="center">
      <VoteModal isOpen={showVoteModal} onDismiss={toggleVoteModal} proposalId="1" support={true} />
      <ProposalInfo gap="lg" justify="start" style={{ maxWidth: '820px' }}>
        <RowBetween style={{ width: '100%' }}>
          <ArrowWrapper to="/vote">
            <ArrowLeft size={20} /> All Proposals
          </ArrowWrapper>
          <ProposalStatus status="active">ACTIVE</ProposalStatus>
        </RowBetween>
        <AutoColumn gap="10px" style={{ width: '100%' }}>
          <TYPE.largeHeader style={{ marginBottom: '.5rem' }}>Deploy Uniswap V3 on Scroll</TYPE.largeHeader>
          <RowBetween>
            <TYPE.main>Voting ends approximately November 30, 2023 at 12:12 PM GMT+5:30</TYPE.main>
          </RowBetween>
          <h5 style={{ textAlign: 'justify' }}>
            Note: First, delegate voting power to yourself, and then vote for the proposal. Your given votes will be
            reflected in about 1 hour as they are bridged from zkEVM to Ethereum.
          </h5>
        </AutoColumn>

        <RowFixed style={{ width: '100%', gap: '12px' }}>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => delegate()}>
            Delegate
          </ButtonPrimary>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => votePositive()}>
            Vote For using zkEVM
          </ButtonPrimary>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => voteNegative()}>
            Vote Against using zkEVM
          </ButtonPrimary>
        </RowFixed>
        {proposalInfo ? (
          <CardWrapper>
            <StyledDataCard>
              <CardSection>
                <AutoColumn gap="md">
                  <WrapSmall>
                    <TYPE.black fontWeight={600}>For</TYPE.black>
                    <TYPE.black fontWeight={600}> {voteFor}</TYPE.black>
                  </WrapSmall>
                </AutoColumn>
              </CardSection>
            </StyledDataCard>
            <StyledDataCard>
              <CardSection>
                <AutoColumn gap="md">
                  <WrapSmall>
                    <TYPE.black fontWeight={600}>Against</TYPE.black>
                    <TYPE.black fontWeight={600}>{voteAgainst}</TYPE.black>
                  </WrapSmall>
                </AutoColumn>
              </CardSection>
            </StyledDataCard>
          </CardWrapper>
        ) : (
          ''
        )}
        <TYPE.mediumHeader fontWeight={600}>Details</TYPE.mediumHeader>
        <h4 style={{ fontWeight: 400, margin: '0' }}>
          1: ENS Public Resolver.setText(0x0b9638d2c5bd4528d603562a1fa1e734fe1b88e680f448d779531e9bc2b55f12, 534352,
          0x6774Bcbd5ceCeF1336b5300fb5186a12DDD8b367, 0x70C62C8b8e801124A4Aa81ce07b637A3e83cb919)
        </h4>

        <h2 style={{ margin: '0' }}>Description</h2>
        <h4 style={{ fontWeight: 400, textAlign: 'justify', margin: '0' }}>
          After a successful temperature check as well as deployments of Uniswap V3 on both our Alpha and Sepolia
          testnets, Scroll looks to move towards a final governance proposal to officially approve Scroll’s Uniswap V3
          deployment on its newly launched mainnet.
        </h4>

        <h2 style={{ margin: '0' }}>Proposal Overview</h2>
        <h4 style={{ fontWeight: 400, textAlign: 'justify', margin: '0' }}>
          We propose that the Uniswap DAO recognizes Scroll’s mainnet deployment of Uniswap V3 as the official -
          canonical deployment. Uniswap V3 has already been deployed and highly utilized on Scroll’s Alpha and Sepolia
          testnets, with the router contract having processed over 1.8M and 450K transactions on each testnet,
          respectively. A brief overview of Scroll:
        </h4>

        <h4 style={{ fontWeight: 400, textAlign: 'justify', margin: '0' }}>
          - Scroll is a bytecode-compatible zk-rollup, a native zkEVM scaling solution for Ethereum.<br></br> - Scroll
          is an open-source project developed in collaboration with the Ethereum Foundation Privacy and Scaling
          Explorations organization.<br></br> - Our community ethos and vision are aligned with Ethereum. We are
          committed to a secure, decentralized, censorship-resistant, and efficient future that Ethereum offers through
          our plans to decentralize Scroll sequencers and provers.
        </h4>
        <h2 style={{ margin: '0' }}>Motivation</h2>
        <h4 style={{ fontWeight: 400, textAlign: 'justify', margin: '0' }}>
          We believe that Uniswap being deployed on multiple Ethereum L2s is integral for encouraging competition and
          diversity of technical solutions to scale Ethereum. Furthermore, we believe that Uniswap’s community and the
          ecosystem that Scroll strives for are closely aligned. Both projects are building trustless, decentralized,
          and secure financial infrastructure that is accessible to anyone, regardless of merit or location. Deploying
          to Scroll offers many benefits, including significant user savings, an expanded user base, capturing the zkEVM
          market, and fostering L2 native innovation. The endgame of Ethereum and its L2s will be fundamentally
          underpinned by ZK— this deployment puts Uniswap in the best position to capitalize on the future of the EVM
          ecosystem by integrating with the most Ethereum-aligned and future-proof L2. Uniswap on Scroll will integrate
          closely with Scroll’s rapidly growing ecosystem. Dozens of projects have committed to deploying on our
          mainnet, and over 150 have deployed on our testnets, including AAVE, Lens, the Graph, Covalent, Safe, and
          Etherscan to name a few. Given the excitement around Scroll and current usage of our testnet, we expect
          hundreds of projects to deploy on our mainnet post-launch. Importantly, Uniswap on Scroll will propel L2 DEX
          innovation. We are on the brink of uncovering L2 native use cases that have not been feasible on Ethereum L1.
          Scroll will bring new developers and ecosystem integrations to Uniswap.
        </h4>
        <h2 style={{ margin: '0' }}>Additional information for cross-chain deployments</h2>
        <h4 style={{ fontWeight: 400, textAlign: 'justify', margin: '0' }}>
          Our focus has always been on providing the best possible experience for developers, and we have successfully
          delivered on this promise on our testnet, which we will continue to do on mainnet. We are proud to say that we
          are bytecode-compatible, meaning that migrating dapps from any EVM chain is easy and hassle-free.
          <br></br>
          <br></br>
          <b>EVM-equivalent: </b>Scroll uses a forked version of Geth, enabling seamless infrastructure migration. Any
          application can be migrated to Scroll without code changes and additional audits.
          <br></br>
          <b>Developer friendly:</b> Scroll will support all existing development tools, including debuggers. Developers
          can work with a familiar development environment. No bytecode re-audits will be required minimizing the risk
          surface tremendously. <br></br>
          <b>Security:</b> Scroll inherits most of EVM’s features and security, which is by far the most battle-tested
          smart contract infrastructure in the entire space. <br></br>
          <b>Decentralization:</b> Scroll is leading the way in developing a decentralized prover network and has
          already committed to outsourcing proving. By decentralizing proof generation to the community, Scroll can
          achieve efficient proof generation and establish a more robust ecosystem.
        </h4>
        <AutoColumn gap="md">
          <TYPE.mediumHeader fontWeight={600}>Proposer</TYPE.mediumHeader>
          <ProposerAddressLink href="https://etherscan.io/address/0xB4e6ee231C86bBcCB35935244CBE9cE333D30Bdf">
            <ReactMarkdown source="0xB4e6ee231C86bBcCB35935244CBE9cE333D30Bdf" />
          </ProposerAddressLink>
        </AutoColumn>
      </ProposalInfo>
    </PageWrapper>
  )
}

import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import PoolV2ABI from '@pooltogether/pooltogether-contracts/abis/BasePool.json'

const pt = require('pooltogetherjs')

let provider = ethers.getDefaultProvider()

// Mainnet Dai Pool v2 Contract:
const contractAddress = '0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958'

// v2 Pool Contract ABI from '@pooltogether/pooltogether-contracts':
const abi = PoolV2ABI

const contract = new ethers.Contract(
  contractAddress,
  abi,
  provider
)

const contractDataEffect = async () => {
  const accountedBalance = await contract.accountedBalance()

  // Balance is a non-constant function (more on this here: https://docs.ethers.io/ethers.js/html/api-contract.html)
  // so we need to craft the call data manually
  const balanceCallData = contract.interface.functions.balance.encode([])
  const result = await provider.call({ to: contract.address, data: balanceCallData })
  const balance = contract.interface.functions.balance.decode(result)

  // We need the current draw ID to get the current Draw data
  const currentOpenDrawId = await contract.currentOpenDrawId()
  const currentDraw = await contract.getDraw(currentOpenDrawId)

  return {
    balance,
    accountedBalance,
    currentDraw,
  }
}

export default function Home() {
  const [data, setData] = useState({})

  useEffect(() => {
    const getData = async () => {
      const data = await contractDataEffect()
      setData(data)
    }
    getData()
  }, [])

  const {
    balance,
    accountedBalance,
    currentDraw,
  } = data

  let prize = ethers.utils.bigNumberify(0)
  if (balance) {
    prize = pt.utils.calculatePrize(
      balance,
      accountedBalance,
      currentDraw.feeFraction
    )
  }

  return (
    <div
      className="container"
      style={{
        background: 'rgb(23, 10, 40)',
        color: '#fff',
        padding: 44,
        fontFamily: 'Arial',
      }}
    >
      <div
        style={{
          fontSize: 40
        }}
      >
        Prize in DAI:
        <br />
        {ethers.utils.formatUnits(prize.toString(), 18)}  
      </div>
      
      <br />
      <br />

      <div
        style={{
          color: '#5ac',
          fontSize: 20
        }}
      >
        Prize in Wei:
        <br />
        {prize.toString()}
      </div>
    </div>
  )
}

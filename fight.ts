import { Room } from './model'
// import { Contract } from '@ethersproject/contracts'
// import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
// import * as contrInterface from './abi/interface.json'
// import { BigNumber } from 'ethers'

interface Player {
  monSelectedId?: string | number
  account?: string
  isCreator?: boolean
  isOtherPlayer?: boolean
}

interface Ready {
  monSelectedId?: string | number
  otherPlayer?: string
  room?: Room
  creator?: string
}

export default class Fight {
  players: Player[]
  status: string

  constructor() {
    this.players = [{}, {}]
  }

  getPlayers() {
    return this.players
  }

  setPlayers(params: Ready) {
    if (!params) return

    const player: Player = {
      monSelectedId: params.monSelectedId,
      account: params?.otherPlayer || params.creator,
      isCreator: !!params.creator,
      isOtherPlayer: !!params.otherPlayer,
    }

    if (player.isCreator) {
      this.players[0] = player
    }

    if (player.isOtherPlayer) {
      this.players[1] = player
    }
  }

  async call() {
    // const players = this.getPlayers()

    // return players?.length === 2
    //   ? await this.fight(players[0].monSelectedId, players[1].monSelectedId)
    //   : null


      return this.getPlayers()
  }

  // async fight(p1Choice: string | number, p2Choice: string | number) {
  //   //
  //   if (p1Choice === null || p2Choice === null) {
  //     return null
  //   }

  //   const CONTRACT_ADDRESS: string = process.env.TEST_CONTRACT_ADDRESS
  //   // let ERC20_CONTRACT_ADDRESS: string = process.env.REACT_APP_TEST_ERC20
  //   // let ERC1155_CONTRACT_ADDRESS: string = process.env.REACT_APP_TEST_ERC1155

  //   let provider = new WebSocketProvider(
  //     `wss://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  //   )

  //   // fallback https
  //   if (!provider)
  //     provider = new JsonRpcProvider(
  //       `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  //     )

  //   const contr = new Contract(CONTRACT_ADDRESS, contrInterface, provider)

  //   const overrides = {
  //     gasLimit: 120000,
  //   }

  //   try {
  //     const tx = await contr
  //       ?.fight(p1Choice, p2Choice, overrides)
  //       ?.catch((err: any) => {
  //         console.error('Fight error, ', err?.toString())
  //       })
  //     const recpt = await tx?.wait()
  //     if (recpt && recpt.status) {
  //       //   setFightTxDone(true)
  //       console.log('Fight receipt, ', recpt.status)
  //     }

  //     if (recpt && !recpt.status) {
  //       console.error(`Server: Error, Tx hash: ${recpt.transactionHash}`)
  //     }
  //   } catch (error) {
  //     console.error(
  //       `Server: Fight function error: ${error.data?.message || ''}`,
  //     )
  //   }
  // }

  // emitReward() {
  //   const results = null

  //   const CONTRACT_ADDRESS: string = process.env.TEST_CONTRACT_ADDRESS

  //   let provider = new WebSocketProvider(
  //     `wss://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  //   )

  //   // fallback https
  //   if (!provider)
  //     provider = new JsonRpcProvider(
  //       `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  //     )

  //   const contr = new Contract(CONTRACT_ADDRESS, contrInterface, provider)

  //   contr.on('FightResults', (_winnerId, _round) => {
  //     const winId = BigNumber.from(_winnerId._hex).toNumber()
  //     const round = BigNumber.from(_round._hex).toNumber()
  //     // setWinner(winId)
  //     results['winner'] = winId
  //     // setRounds(round)
  //     results['rounds'] = round
  //     // refreshMons()
  //     results['refreshMon'] = true
  //     // setDisableFightBtn(false)
  //     results['disableFightBtn'] = false
  //   })

  //   contr.on('Rewards', (_winnerId, _rewards) => {
  //     const rewards = BigNumber.from(_rewards._hex).toNumber()
  //     // setRewards(rewards)
  //     results['rewards'] = rewards
  //     // refreshMons()
  //     results['refreshMons'] = true
  //     // setDisableFightBtn(false)
  //     results['disableFightBtn'] = false
  //     console.log('rewards winner', _winnerId)
  //   })

  //   contr.off('FightResults', (_winnerId, _round) => {
  //     // setDisableFightBtn(false)
  //     results['disableFightBtn'] = false
  //     console.log(_winnerId, _round)
  //   })
  //   contr.off('Rewards', (_winnerId, _round) => {
  //     // setDisableFightBtn(false)
  //     results['disableFightBtn'] = false
  //     console.log(_winnerId, _round)
  //   })

  //   // ws send results to players or connected
  //   return results
  // }
}

import { Server, OPEN } from 'ws'
import Fight from './fight.js'
import { WsGame } from './model.js'
import Rooms from './rooms.js'
import { isEmpty } from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wss: any = new Server({ port: 40510 })

wss.getUniqueID = function (): string {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return s4() + s4() + '-' + s4()
}

const rooms = new Rooms()
const totalOnline = {}

/**
 * Sends data to all connected sockets except the sender
 *
 * @param  {WebSocket} ws
 * @param  {string} data
 * @returns void
 */
const sendToAllExceptSender = (ws: WebSocket, data: string): void => {
  wss.clients.forEach(function each(client: WebSocket) {
    if (client !== ws && client.readyState === OPEN) {
      client.send(data)
    }
  })
}

/**
 * Sends data to all connected sockets
 *
 * @param  {string} data
 * @returns void
 */
const sendToAllIncludeSender = (data: string): void => {
  wss.clients.forEach(function each(client: WebSocket) {
    if (client.readyState === OPEN) {
      client.send(data)
    }
  })
}

wss.on('connection', (ws: WsGame) => {
  ws['id'] = wss.getUniqueID()

  ws.onmessage = ({ data }) => {
    const obj = JSON.parse(data as string)
    const type = obj.type
    const params = obj.params
    const _rooms = rooms.getRooms()

    // get rooms
    const getRoomsObj = {
      type: 'get_rooms',
      allRooms: _rooms,
    }

    // online
    const onlineObj = {
      type: 'online',
      online: Object.keys(totalOnline)?.length,
    }

    // start
    const startObj = {
      type: 'start',
      params,
    }

    // ready
    const readyObj = {
      type: 'ready',
      params,
    }

    let hasFilled = false

    _rooms[params?.room?.room]['fight'] = new Fight()

    switch (type) {
      case 'get_rooms':
        sendToAllIncludeSender(JSON.stringify(getRoomsObj))
        break
      case 'create':
        rooms.create(ws, params.creator, sendToAllIncludeSender)
        break
      case 'join':
        rooms.join(ws, params, sendToAllIncludeSender)
        break
      case 'leave':
        rooms.leave(ws, params, sendToAllIncludeSender)
        break
      case 'chat':
        sendToAllExceptSender(ws, data)
        break
      case 'online':
        if (obj?.acct) {
          totalOnline[obj.acct] = ws.id
        }

        sendToAllIncludeSender(JSON.stringify(onlineObj))
        break
      case 'start':
        _rooms[params?.room?.room]?.forEach((client: WsGame) =>
          client.send(JSON.stringify(startObj)),
        )
        break
      case 'ready':
        // _rooms[params?.room?.room]['fight'] = new Fight()

        console.log(_rooms[params?.room?.room]['fight']);
        

        _rooms[params?.room?.room].fight.setPlayers(params)
        console.log(_rooms[params?.room?.room]['fight']);


        // check fight players has filled

        _rooms[params?.room?.room].fight.players.every(player => {
          if ( isEmpty (player) ) { 
            hasFilled = false
            return false 
          }

            hasFilled = true

        return true
    })

    
    if (hasFilled) {
        _rooms[params?.room?.room]?.forEach((client: WsGame) => {
          client.send(JSON.stringify(_rooms[params?.room?.room]?.fight?.players))
        })
      }

        break
      case 'fight':
        // // set creator as one of players
        // _rooms[params?.room?.room].fight.setPlayers(params)
        // _rooms[params?.room?.room].fight.call().then((results) => {
        //   // const emitReward = _rooms[params?.room?.room].fight.emitReward()
        //   // send
        //   _rooms[params?.room?.room]?.forEach((client: WsGame) => {
        //     console.log('fight start client', client)
          
        //     client.send(JSON.stringify(results))
        //  })
        // })

        // get fight.players data
        // send back to creator, then run fight on client side to call fight func in blockchain
console.log('get fight.players data then run fight function')

        break
      default:
        console.warn(`Type: ${type} unknown`)
        break
    }
  }

  ws.onclose = function () {
    const usrAcct = Object.keys(totalOnline).map((key) => {
      if (totalOnline[key] === ws.id) {
        delete totalOnline[key]
        return key
      } else {
        return 'unknown'
      }
    })
    console.log(`Client ${usrAcct} has disconnected!`)
  }
})

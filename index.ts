import { Server, OPEN } from 'ws'
import { WsGame } from './model.js'
import Rooms from './rooms.js'

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
      rooms: _rooms,
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
        _rooms[params?.room?.room]?.forEach((cl: WsGame) =>
          cl.send(JSON.stringify(startObj)),
        )
        break
      case 'ready':
        _rooms[params?.room?.room]?.forEach((cl: WsGame) =>
          cl.send(JSON.stringify(readyObj)),
        )
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

import { Server, OPEN } from 'ws'
import Rooms from './rooms.js'

const wss = new Server({ port: 40510 })

wss.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return s4() + s4() + '-' + s4()
}

const rooms = new Rooms()
let totalOnline = {}

const sendToAllExceptSender = (ws, data) => {
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === OPEN) {
      client.send(data)
    }
  })
}
const sendToAllIncludeSender = (data) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === OPEN) {
      client.send(data)
    }
  })
}

wss.on('connection', (ws) => {
  ws.id = wss.getUniqueID()

  ws.onmessage = ({ data }) => {
    const obj = JSON.parse(data)
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
        _rooms[params?.room?.room]?.forEach((cl) =>
          cl.send(JSON.stringify(startObj)),
        )
        break
      case 'ready':
        _rooms[params?.room?.room]?.forEach((cl) =>
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

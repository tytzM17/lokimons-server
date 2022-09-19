const WebSocket = require('ws')
const Rooms = require('./rooms.js')
// var util = require('util')

const wss = new WebSocket.Server({ port: 40510 })

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
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}
const sendToAllIncludeSender = (data) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
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

    switch (type) {
      case 'get_rooms':
        const getRoomsObj = {
          type: 'get_rooms',
          rooms: _rooms,
        }
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
        const onlineObj = {
          type: 'online',
          online: Object.keys(totalOnline)?.length,
        }
        sendToAllIncludeSender(JSON.stringify(onlineObj))
        break
      case 'start':
        // console.log(util.inspect(_rooms[params?.code]));
        const startObj = {
          type: 'start',
          params,
        }
        _rooms[params?.room?.room]?.forEach(cl => cl.send(JSON.stringify(startObj)));
        break
        case 'ready':
          const readyObj = {
            type: 'ready',
            params,
          }
          _rooms[params?.room?.room]?.forEach(cl => cl.send(JSON.stringify(readyObj)));
          break
      default:
        console.warn(`Type: ${type} unknown`)
        break
    }
  }

  ws.onclose = function () {
    const usrAcct = Object.keys(totalOnline).map((key) => {
      if (totalOnline[key] === ws.id) {
        delete  totalOnline[key]
        return key
      } else {
        return 'unknown'
      }
    })
    console.log(`Client ${usrAcct} has disconnected!`)
  }
})

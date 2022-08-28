const WebSocket = require('ws')
const Rooms = require('./rooms.js')

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

wss.on('connection', (ws) => {
  ws.id = wss.getUniqueID()
  console.log('total online', Object.keys(totalOnline).length);

  ws.onmessage = ({ data }) => {
    // chat
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })

    // room
    const obj = JSON.parse(data)
    const type = obj.type
    const params = obj.params

    rooms.display()

    switch (type) {
      case 'create':
        rooms.create(ws)
        break
      case 'join':
        rooms.join(params, ws)
        break
      case 'leave':
        rooms.leave(ws)
        break
      case 'online':
        obj?.acct ? totalOnline[obj.acct]=obj?.msg : null
        break
      default:
        console.warn(`Type: ${type} unknown`)
        break
    }
  }

  const onlineObj = {
    type: 'online',
    online: Object.keys(totalOnline).length
  } 
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(onlineObj))
    }
  })



  ws.onclose = function () {
    console.log(`Client ${ws.id} has disconnected!`)
  }
})

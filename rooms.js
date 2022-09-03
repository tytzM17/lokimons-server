'use strict'

module.exports = class Rooms {
  constructor() {
    this.maxClient = 2
    this.rooms = {}
  }

  generalInformation(ws, sendFunc, msg) {
    let obj
    if (ws['room'] !== undefined) {
      obj = {
        type: 'info',
        params: {
          room: ws['room'],
          clients: this.rooms[ws['room']]?.length,
          msg
        },
      }
    } 
    else {
      obj = {
        type: 'info',
        params: {
          room: 'no room',
        },
      }
    }

    sendFunc ? sendFunc(ws, JSON.stringify(obj)) : ws.send(JSON.stringify(obj))
  }

  genKey(length) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  getRooms() {
    return this.rooms
  }

  create(ws, creator, sendFunc) {
    if (!ws) {
      ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws'}))
      return
    }
    const room = this.genKey(5)
    this.rooms[room] = [ws]
    ws['room'] = room

    // this.generalInformation(ws, sendFunc, 'create')

    let obj = {
      type: 'create',
      params: {
        room,
        clients: this.rooms[room]?.length,
        isClosed: false,
        players: [creator],
        creator,
      },
    }

    sendFunc(ws, JSON.stringify(obj))
  }

  join(ws, params, sendFunc) {
    if (!ws) {
      ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws'}))
      return
    }
    const room = params.code
    if (!Object.keys(this.rooms)?.includes(room)) {
      console.warn(`Room ${room} does not exist!`)
      this.generalInformation(ws, null, `Room ${room} does not exist!`)
      return
    }

    if (this.rooms[room]?.length >= this.maxClient) {
      console.warn(`Room ${room} is full!`)
      this.generalInformation(ws, null, `Room ${room} is full!`)
      return
    }

    this.rooms[room].push(ws)
    ws['room'] = room
    // this.generalInformation(ws, sendFunc, 'join')
    // room: ws['room'],
    // clients: this.rooms[ws['room']]?.length,
    // creator: ws['creator'],
    let players = [ params?.creator, params?.player ]
    let obj = {
      type: 'join',
      params: {
        room,
        clients: this.rooms[room]?.length,
        isClosed: false,
        players,
        creator: params?.creator,
      },
    }

    sendFunc(ws, JSON.stringify(obj))
  }
  leave(ws, params, sendFunc) {
    if (!ws) {
      ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws'}))
      return
    }
    const room = ws.room
    this.rooms[room] = this.rooms[room]?.filter((so) => so !== ws)
    ws['room'] = undefined

    let isClosed = false

    if (this.rooms[room]?.length == 0 || params.isCreator) {
      this.close(room)
      isClosed = true
    }

    const remainingPlayer = params?.players?.filter(player => player !== params.leaver)
    let obj = {
      type: 'leave',
      params: {
        room,
        clients: this.rooms[room]?.length,
        isClosed,
        players: isClosed ? [] : remainingPlayer
      },
    }

    sendFunc(ws, JSON.stringify(obj))
  }

  close(room) {
    this.rooms = this.rooms[room]?.filter((key) => key !== room)
  }
}

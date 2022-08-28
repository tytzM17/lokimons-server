'use strict'

module.exports = class Rooms {
  constructor() {
    this.maxClient = 2
    this.rooms = {}
  }

  generalInformation(ws, sendFunc, funcType='info') {
    let obj
    if (ws['room'] !== undefined) {
      obj = {
        type: funcType,
        params: {
          room: ws['room'],
          clients: this.rooms[ws['room']]?.length,
          creator: ws['creator'],
        },
      }
    } else {
      obj = {
        type: funcType,
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
    ws['creator'] = creator

    this.generalInformation(ws, sendFunc, 'create')
  }
  join(ws, params, sendFunc) {
    if (!ws) {
      ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws'}))
      return
    }
    const room = params.code
    if (!Object.keys(this.rooms)?.includes(room)) {
      console.warn(`Room ${room} does not exist!`)
      return
    }

    if (this.rooms[room]?.length >= this.maxClients) {
      console.warn(`Room ${room} is full!`)
      return
    }

    this.rooms[room].push(ws)
    ws['room'] = room
    this.generalInformation(ws, sendFunc, 'join')
  }
  leave(ws) {
    if (!ws) {
      ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws'}))
      return
    }
    const room = ws.room
    this.rooms[room] = this.rooms[room]?.filter((so) => so !== ws)
    ws['room'] = undefined

    if (this.rooms[room]?.length == 0) this.close(room)
  }

  close(room) {
    this.rooms = this.rooms?.filter((key) => key !== room)
  }
}

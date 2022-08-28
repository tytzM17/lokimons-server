'use strict'

module.exports = class Rooms {
  constructor(ws) {
    this.maxClient = 2
    this.rooms = {}
  }

  display(note='Init') {
    const theRooms = JSON.stringify(Object.keys(this.rooms))
    console.log(note + ' maxClient:' + this.maxClient + ' Room(s): ' + theRooms)
  }

  generalInformation() {
    let obj
    if (ws['room'] !== undefined) {
      obj = {
        type: 'info',
        params: {
          room: ws['room'],
          clients: this.rooms[ws['room']]?.length,
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

    ws.send(JSON.stringify(obj))
  }

  genKey(length) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  create(ws) {
    const room = this.genKey(5)
    this.rooms[room] = [ws]
    ws['room'] = room

    this.generalInformation(ws)
    this.display('Create room', this.rooms)
  }
  join(params, ws) {
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

    this.generalInformation(ws)
  }
  leave(ws) {
    const room = ws.room
    this.rooms[room] = this.rooms[room]?.filter((so) => so !== ws)
    ws['room'] = undefined

    if (this.rooms[room]?.length == 0) this.close(room)
  }

  close(room) {
    this.rooms = this.rooms?.filter((key) => key !== room)
  }
}

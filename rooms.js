'use strict'

module.exports = class Rooms {
  constructor(ws) {
    this.maxClient = 2
    this.rooms = {}
    this.ws = ws
  }

  display(note='Init', rooms=this.rooms) {
    const theRooms = JSON.stringify(Object.keys(rooms))
    console.log(note + ' maxClient:' + this.maxClient + ' Room(s): ' + theRooms)
  }

  generalInformation() {
    let obj
    if (this.ws['room'] !== undefined) {
      obj = {
        type: 'info',
        params: {
          room: this.ws['room'],
          clients: this.rooms[this.ws['room']]?.length,
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

    this.ws.send(JSON.stringify(obj))
  }

  genKey(length) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  create() {
    const room = this.genKey(5)
    this.rooms[room] = [this.ws]
    this.ws['room'] = room

    this.generalInformation(this.ws)
    this.display('Create room', this.rooms)
  }
  join(params) {
    const room = params.code
    if (!Object.keys(this.rooms)?.includes(room)) {
      console.warn(`Room ${room} does not exist!`)
      return
    }

    if (this.rooms[room]?.length >= this.maxClients) {
      console.warn(`Room ${room} is full!`)
      return
    }

    this.rooms[room].push(this.ws)
    this.ws['room'] = room

    this.generalInformation(this.ws)
  }
  leave() {
    const room = this.ws.room
    this.rooms[room] = this.rooms[room]?.filter((so) => so !== this.ws)
    this.ws['room'] = undefined

    if (this.rooms[room]?.length == 0) this.close(room)
  }

  close(room) {
    this.rooms = this.rooms?.filter((key) => key !== room)
  }
}

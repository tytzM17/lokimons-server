'use strict'

import { AnyFunc, JoinParams, LeaveParams, Room, AllRooms, WsSendFunc, WsGame } from './model'

/**
 * Class representing rooms
 */
export default class Rooms {
  maxClient: number
  rooms: AllRooms

  /**
   * Create or delete rooms
   */
  constructor() {
    this.maxClient = 2
    this.rooms = {}
  }

  /**
   * Show rooms info
   *
   * @param  {WebSocket} ws
   * @param  {AnyFunc} sendFunc
   * @param  {string} msg
   * @returns void
   */
  generalInformation(ws: WebSocket, sendFunc: AnyFunc, msg: string): void {
    let obj: object
    if (ws['room'] !== undefined) {
      obj = {
        type: 'info',
        params: {
          room: ws['room'],
          clients: this.rooms[ws['room']]?.length,
          msg,
        },
      }
    } else {
      obj = {
        type: 'info',
        params: {
          room: 'no room',
        },
      }
    }

    sendFunc ? sendFunc(ws, JSON.stringify(obj)) : ws.send(JSON.stringify(obj))
  }

  /**
   * Generate key or code for a room
   *
   * @param  {number} length
   * @returns {string} key or code
   */
  genKey(length: number): string {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  /**
   * Get rooms value
   * @return {AllRooms} the rooms value
   */
  getRooms(): AllRooms {
    return this.rooms
  }

  /**
   * Create a room
   *
   * @param  {WebSocket} ws
   * @param  {string} creator
   * @param  {WsSendFunc} sendFunc
   * @returns void
   */
  create(ws: WebSocket, creator: string, sendFunc: WsSendFunc): void {
    if (!ws) {
      ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws' }))
      return
    }
    const room = this.genKey(5)
    this.rooms[room] = [ws]
    ws['room'] = room

    const obj = {
      type: 'create',
      params: {
        room,
        clients: this.rooms[room]?.length,
        isClosed: false,
        players: [creator],
        creator,
      },
    }

    ws['params'] = obj.params

    sendFunc(JSON.stringify(obj))
  }

  /**
   * Joins a room
   * @param  {WebSocket} ws
   * @param  {JoinParams} params
   * @param  {WsSendFunc} sendFunc
   * @returns void
   */
  join(ws: WebSocket, params: JoinParams, sendFunc: WsSendFunc): void {
    if (!ws) {
      ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws' }))
      return
    }
    const room = params?.code
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

    const players = [params?.creator, params?.player]
    const obj = {
      type: 'join',
      params: {
        room,
        clients: this.rooms[room]?.length,
        isClosed: false,
        players,
        creator: params?.creator,
      },
    }

    sendFunc(JSON.stringify(obj))
  }

  /**
   * Leaves a room
   *
   * @param  {WebSocket} ws
   * @param  {LeaveParams} params
   * @param  {WsSendFunc} sendFunc
   * @returns void
   */
  leave(ws: WebSocket, params: LeaveParams, sendFunc: WsSendFunc): void {
    if (!ws) {
      ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws' }))
      return
    }
    // const room = ws.room
    const room = params?.code
    this.rooms[room] = this.rooms[room]?.filter((so: WebSocket) => so !== ws)
    ws['room'] = undefined

    let isClosed = false

    if (this.rooms[room]?.length == 0 || params.isCreator) {
      this.close(room)
      isClosed = true
    }

    const remainingPlayer = params?.players?.filter(
      (player) => player !== params.leaver,
    )
    const obj = {
      type: 'leave',
      params: {
        room,
        clients: this.rooms && this.rooms[room] ? this.rooms[room]?.length : 0,
        isClosed,
        players: isClosed ? [] : remainingPlayer,
      },
    }

     sendFunc(JSON.stringify(obj))
    // this.rooms[room]?.forEach((client) => {
    //   client.send(JSON.stringify(obj))
    // })
  }
  /**
   * @param  {string} room
   * @returns void
   */
  close(room: string): void {
    if (this.rooms) {
      delete this.rooms[room]
    }
  }
}

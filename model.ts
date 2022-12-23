/* eslint-disable @typescript-eslint/no-explicit-any */
interface AllRooms {
  room?: WebSocket[]
  // players?: string[]
  // creator?: string
  // prolly client: string here
}

interface Room {
  room?: string
  players?: string[]
  creator?: string
  clients?: number
}

interface JoinParams {
  creator: string
  player: string
  code: string
}

interface LeaveParams {
  players: string[]
  isCreator: boolean
  leaver: string
  code: string
  creator: string
}

interface CreateSendParams {
  room: string
  clients: number
  isClosed: boolean
  players: string[]
  creator: string
}

interface WsGame extends WebSocket {
  id: string
  room: string
  params: JoinParams | LeaveParams | CreateSendParams
}

export type AnyFunc = (...args: any[]) => any

export type VoidFunc = (...args: any[]) => void

export type WsSendFunc = (
  data: string | ArrayBufferLike | Blob | ArrayBufferView,
) => void

export type { Room, AllRooms, JoinParams, LeaveParams, WsGame }

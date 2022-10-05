'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class representing rooms
 */
class Rooms {
    /**
     * Create or delete rooms
     */
    constructor() {
        this.maxClient = 2;
        this.rooms = {};
    }
    /**
     * Show rooms info
     *
     * @param  {WebSocket} ws
     * @param  {AnyFunc} sendFunc
     * @param  {string} msg
     * @returns void
     */
    generalInformation(ws, sendFunc, msg) {
        var _a;
        let obj;
        if (ws['room'] !== undefined) {
            obj = {
                type: 'info',
                params: {
                    room: ws['room'],
                    clients: (_a = this.rooms[ws['room']]) === null || _a === void 0 ? void 0 : _a.length,
                    msg,
                },
            };
        }
        else {
            obj = {
                type: 'info',
                params: {
                    room: 'no room',
                },
            };
        }
        sendFunc ? sendFunc(ws, JSON.stringify(obj)) : ws.send(JSON.stringify(obj));
    }
    /**
     * Generate key or code for a room
     *
     * @param  {number} length
     * @returns {string} key or code
     */
    genKey(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    /**
     * Get rooms value
     * @return {AllRooms} the rooms value
     */
    getRooms() {
        return this.rooms;
    }
    /**
     * Create a room
     *
     * @param  {WebSocket} ws
     * @param  {string} creator
     * @param  {WsSendFunc} sendFunc
     * @returns void
     */
    create(ws, creator, sendFunc) {
        var _a;
        if (!ws) {
            ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws' }));
            return;
        }
        const room = this.genKey(5);
        this.rooms[room] = [ws];
        ws['room'] = room;
        const obj = {
            type: 'create',
            params: {
                room,
                clients: (_a = this.rooms[room]) === null || _a === void 0 ? void 0 : _a.length,
                isClosed: false,
                players: [creator],
                creator,
            },
        };
        ws['params'] = obj.params;
        sendFunc(JSON.stringify(obj));
    }
    /**
     * Joins a room
     * @param  {WebSocket} ws
     * @param  {JoinParams} params
     * @param  {WsSendFunc} sendFunc
     * @returns void
     */
    join(ws, params, sendFunc) {
        var _a, _b, _c;
        if (!ws) {
            ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws' }));
            return;
        }
        const room = params === null || params === void 0 ? void 0 : params.code;
        if (!((_a = Object.keys(this.rooms)) === null || _a === void 0 ? void 0 : _a.includes(room))) {
            console.warn(`Room ${room} does not exist!`);
            this.generalInformation(ws, null, `Room ${room} does not exist!`);
            return;
        }
        if (((_b = this.rooms[room]) === null || _b === void 0 ? void 0 : _b.length) >= this.maxClient) {
            console.warn(`Room ${room} is full!`);
            this.generalInformation(ws, null, `Room ${room} is full!`);
            return;
        }
        this.rooms[room].push(ws);
        ws['room'] = room;
        const players = [params === null || params === void 0 ? void 0 : params.creator, params === null || params === void 0 ? void 0 : params.player];
        const obj = {
            type: 'join',
            params: {
                room,
                clients: (_c = this.rooms[room]) === null || _c === void 0 ? void 0 : _c.length,
                isClosed: false,
                players,
                creator: params === null || params === void 0 ? void 0 : params.creator,
            },
        };
        sendFunc(JSON.stringify(obj));
    }
    /**
     * Leaves a room
     *
     * @param  {WebSocket} ws
     * @param  {LeaveParams} params
     * @param  {WsSendFunc} sendFunc
     * @returns void
     */
    leave(ws, params, sendFunc) {
        var _a, _b, _c, _d;
        if (!ws) {
            ws.send(JSON.stringify({ type: 'info', msg: 'error, no ws' }));
            return;
        }
        // const room = ws.room
        const room = params === null || params === void 0 ? void 0 : params.code;
        this.rooms[room] = (_a = this.rooms[room]) === null || _a === void 0 ? void 0 : _a.filter((so) => so !== ws);
        ws['room'] = undefined;
        let isClosed = false;
        if (((_b = this.rooms[room]) === null || _b === void 0 ? void 0 : _b.length) == 0 || params.isCreator) {
            this.close(room);
            isClosed = true;
        }
        const remainingPlayer = (_c = params === null || params === void 0 ? void 0 : params.players) === null || _c === void 0 ? void 0 : _c.filter((player) => player !== params.leaver);
        const obj = {
            type: 'leave',
            params: {
                room,
                clients: this.rooms && this.rooms[room] ? (_d = this.rooms[room]) === null || _d === void 0 ? void 0 : _d.length : 0,
                isClosed,
                players: isClosed ? [] : remainingPlayer,
            },
        };
        sendFunc(JSON.stringify(obj));
        // this.rooms[room]?.forEach((client) => {
        //   client.send(JSON.stringify(obj))
        // })
    }
    /**
     * @param  {string} room
     * @returns void
     */
    close(room) {
        if (this.rooms) {
            delete this.rooms[room];
        }
    }
}
exports.default = Rooms;
//# sourceMappingURL=rooms.js.map
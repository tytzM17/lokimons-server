"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const fight_js_1 = __importDefault(require("./fight.js"));
const rooms_js_1 = __importDefault(require("./rooms.js"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wss = new ws_1.Server({ port: 40510 });
wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4();
};
const rooms = new rooms_js_1.default();
const totalOnline = {};
/**
 * Sends data to all connected sockets except the sender
 *
 * @param  {WebSocket} ws
 * @param  {string} data
 * @returns void
 */
const sendToAllExceptSender = (ws, data) => {
    wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === ws_1.OPEN) {
            client.send(data);
        }
    });
};
/**
 * Sends data to all connected sockets
 *
 * @param  {string} data
 * @returns void
 */
const sendToAllIncludeSender = (data) => {
    wss.clients.forEach(function each(client) {
        if (client.readyState === ws_1.OPEN) {
            client.send(data);
        }
    });
};
wss.on('connection', (ws) => {
    ws['id'] = wss.getUniqueID();
    ws.onmessage = ({ data }) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const obj = JSON.parse(data);
        const type = obj.type;
        const params = obj.params;
        const _rooms = rooms.getRooms();
        // get rooms
        const getRoomsObj = {
            type: 'get_rooms',
            allRooms: _rooms,
        };
        // online
        const onlineObj = {
            type: 'online',
            online: (_a = Object.keys(totalOnline)) === null || _a === void 0 ? void 0 : _a.length,
        };
        // start
        const startObj = {
            type: 'start',
            params,
        };
        // ready
        const readyObj = {
            type: 'ready',
            params,
        };
        switch (type) {
            case 'get_rooms':
                sendToAllIncludeSender(JSON.stringify(getRoomsObj));
                break;
            case 'create':
                rooms.create(ws, params.creator, sendToAllIncludeSender);
                break;
            case 'join':
                rooms.join(ws, params, sendToAllIncludeSender);
                break;
            case 'leave':
                rooms.leave(ws, params, sendToAllIncludeSender);
                break;
            case 'chat':
                sendToAllExceptSender(ws, data);
                break;
            case 'online':
                if (obj === null || obj === void 0 ? void 0 : obj.acct) {
                    totalOnline[obj.acct] = ws.id;
                }
                sendToAllIncludeSender(JSON.stringify(onlineObj));
                break;
            case 'start':
                (_c = _rooms[(_b = params === null || params === void 0 ? void 0 : params.room) === null || _b === void 0 ? void 0 : _b.room]) === null || _c === void 0 ? void 0 : _c.forEach((client) => client.send(JSON.stringify(startObj)));
                break;
            case 'ready':
                _rooms[(_d = params === null || params === void 0 ? void 0 : params.room) === null || _d === void 0 ? void 0 : _d.room]['fight'] = new fight_js_1.default();
                console.log(_rooms[(_e = params === null || params === void 0 ? void 0 : params.room) === null || _e === void 0 ? void 0 : _e.room]['fight']);
                _rooms[(_f = params === null || params === void 0 ? void 0 : params.room) === null || _f === void 0 ? void 0 : _f.room].fight.setPlayers(params);
                console.log(_rooms[(_g = params === null || params === void 0 ? void 0 : params.room) === null || _g === void 0 ? void 0 : _g.room]['fight']);
                (_j = _rooms[(_h = params === null || params === void 0 ? void 0 : params.room) === null || _h === void 0 ? void 0 : _h.room]) === null || _j === void 0 ? void 0 : _j.forEach((client) => {
                    console.log('fight ready client', client);
                    client.send(JSON.stringify(readyObj));
                });
                break;
            case 'fight':
                // set creator as one of players
                _rooms[(_k = params === null || params === void 0 ? void 0 : params.room) === null || _k === void 0 ? void 0 : _k.room].fight.setPlayers(params);
                _rooms[(_l = params === null || params === void 0 ? void 0 : params.room) === null || _l === void 0 ? void 0 : _l.room].fight.call().then((results) => {
                    var _a, _b;
                    // const emitReward = _rooms[params?.room?.room].fight.emitReward()
                    // send
                    (_b = _rooms[(_a = params === null || params === void 0 ? void 0 : params.room) === null || _a === void 0 ? void 0 : _a.room]) === null || _b === void 0 ? void 0 : _b.forEach((client) => {
                        console.log('fight start client', client);
                        client.send(JSON.stringify(results));
                    });
                });
                break;
            default:
                console.warn(`Type: ${type} unknown`);
                break;
        }
    };
    ws.onclose = function () {
        const usrAcct = Object.keys(totalOnline).map((key) => {
            if (totalOnline[key] === ws.id) {
                delete totalOnline[key];
                return key;
            }
            else {
                return 'unknown';
            }
        });
        console.log(`Client ${usrAcct} has disconnected!`);
    };
});
//# sourceMappingURL=index.js.map
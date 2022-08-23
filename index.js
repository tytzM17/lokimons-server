const WebSocket = require("ws");
const Rooms = require('./rooms.js')

const wss = new WebSocket.Server({ port: 40510 });
const rooms = new Rooms();

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wss.on("connection", ws => {
    ws.id = wss.getUniqueID();
    console.log(`New client connected with id: ${ws.id}`);

    ws.onmessage = ({data}) => {
        // chat
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });

        // room
        const obj = JSON.parse(data);
        const type = obj.type;
        const params = obj.params;
    
        rooms.display()

        switch (type) {
          case "create":
            rooms.create(params);
            break;
          case "join":
            rooms.join(params);
            break;
          case "leave":
            rooms.leave(params);
            break;    
          default:
              console.warn(`Type: ${type} unknown`);
            break;
        }

    };

    ws.onclose = function() {
        console.log(`Client ${ws.id} has disconnected!`);
    };
});
const express = require("express");
const SocketServer = require("ws").Server;
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, process.env.INDEX || "index.html");
const URL = getLocalIp();

function getLocalIp() {
    const os = require("os");
    for (let addresses of Object.values(os.networkInterfaces())) {
        for (let a of addresses) {
            if (a.address.startsWith("192.168.")) {
                return a.address;
            }
        }
    }
    return "localhost";
}

const server = express();
server.use(express.static("files"));
server.use(bodyParser.json());
server.get("/", (req, res) => {
    res.send(fs.readFileSync(INDEX).toString()
        .replace(
            /{{ URL }}/g, "http://"+URL+":"+PORT
        ));
});
server.get("/:channel.js", (req, res) => {
    res.send(fs.readFileSync("./client.js").toString()
        .replace(
            /{{ URL }}/g, "http://"+URL+":"+PORT
        ).replace(
            /{{ CHANNEL }}/g, req.params.channel,
        )
    );
});
server.options("/*/*", function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Content-Length");
    res.sendStatus(200);
    res.end();
});
server.post("/:channel/:method", (req, res) => {
    console.log("LOG", (channels[req.params.channel] || []).length, req.params, req.body);
    if (!req.body || !req.body.time || !req.body.args) { res.sendStatus(400); }
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Content-Length");
    const channel = req.params.channel;
    if (channels[channel]) {
        channels[channel].forEach(
            ws => ws.send(JSON.stringify({
                type: req.params.method,
                time: req.body.time,
                value: req.body.args
            }))
        );
        res.end();
    }
    res.end();
});

const channels = {};

function handleMessage(client, msg) {
    if (msg.channel) {
        if (!channels[msg.channel]) {
            console.log("NEW CH", msg.channel);
            channels[msg.channel] = [];
        }
        channels[msg.channel].push(client);
        client.channels.push(msg.channel);
        console.log("CLIENT ADD CH", msg.channel);
        client.send(JSON.stringify({
            type: "connect",
            value: true,
        }));
    }
}
function cleanupClient(client) {
    client.channels.forEach(channel => {
        if (channels[channel].length === 1) {
            console.log("DEL CH", channel);
            delete channels[channel];
        } else {
            const arr = channels[channel];
            const index = arr.indexOf(client);
            if (index !== -1) {
                arr.splice(index, 1);
            }
        }
    });
}

const wss = new SocketServer({ server: server.listen(PORT, () => console.log("Listening on "+PORT)) });
wss.on("connection", ws => {
    console.log("CLIENT CONN");
    ws.isAlive = true;
    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.channels = [];
    ws.on("message", message => {
        let msg;
        try {
            msg = JSON.parse(message);
        } catch (e) {
            ws.send(JSON.stringify({ error: e.message }));
            return;
        }

        // at this point we have received a message
        handleMessage(ws, msg);
    });
    ws.on("close", () => {
        console.log("CLIENT DISC", ws.channels);
        cleanupClient(ws);
    });
});
setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
            cleanupClient(ws);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(() => {});
    });
}, 30000);

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let games = {};

function broadcastToClients() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(games));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === "create-game") {
      const gameId = data.gameId;
      games[gameId] = {
        timer: 0,
        score: { teamA: 0, teamB: 0 }
      };
    } 
    else if (data.type === "update-timer") {
      const gameId = data.gameId;
      const timerValue = data.timer;
      if (games[gameId]) {
        games[gameId].timer = timerValue;
        broadcastToClients();
        console.log(games);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.get('/games', (req, res) => {
  res.json(Object.keys(games));
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
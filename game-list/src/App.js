import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import axios from 'axios';

const App = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      document.title = 'Game list';
      const response = await axios.get('http://localhost:8080/games');
      setGames(response.data);
    };

    fetchGames();

    // Set up WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'game-list-updated') {
        setGames(Object.keys(data.games));
      } else if (data.type === 'game-updated') {
        setGames((prevGames) => {
          const updatedGames = { ...prevGames, [data.gameId]: data.game };
          return Object.keys(updatedGames);
        });
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    // Clean up WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <Typography variant="h4">Current Games</Typography>
      <List>
        {games.map((gameId) => (
          <ListItem key={gameId}>
            <ListItemText primary={`Game ID: ${gameId}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default App;
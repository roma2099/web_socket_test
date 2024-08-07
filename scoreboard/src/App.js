  import React, { useEffect, useState, useRef } from 'react';
import { Typography, Grid, Button } from '@mui/material';

const App = () => {
  const [score, setScore] = useState({ teamA: 0, teamB: 0 });
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameId, setGameId] = useState("game1");
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const wsRef = useRef(null);
  const lastMinuteRef = useRef(0);

  useEffect(() => {
    document.title = 'Scoreboard';
    wsRef.current = new WebSocket('ws://localhost:8080');

    wsRef.current.onmessage = (event) => {
      const gamesState = JSON.parse(event.data);
      const gameState = gamesState[gameId] || { score: { teamA: 0, teamB: 0 }, timer: 0 };
      setScore(gameState.score);
      setTimer(gameState.timer);
    };

    return () => {
      wsRef.current.close();
    };
  }, [gameId]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - timer * 1000;
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setTimer(elapsed);
        if (Math.floor(elapsed / 60) > lastMinuteRef.current) {
          lastMinuteRef.current = Math.floor(elapsed / 60);
          const message = JSON.stringify({ type: "update-timer", timer: elapsed, isRunning, gameId });
          wsRef.current.send(message);
        }
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timer, gameId]);

  const handleStart = () => {
    setIsRunning(true);
    const message = JSON.stringify({ type: "update-timer", timer, isRunning, gameId });
    wsRef.current.send(message);
  };

  const handleStop = () => {
    setIsRunning(false);
    const message = JSON.stringify({ type: "update-timer", timer, isRunning, gameId });
    wsRef.current.send(message);
  };

  const handleCreateGame = () => {
    const message = JSON.stringify({ type: 'create-game', gameId });
    wsRef.current.send(message);
    console.log(`Game created with ID: ${gameId}`);
  };

  return (
    <div>
      <Typography variant="h4">Futsal Scoreboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h5">Team A: {score.teamA}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h5">Team B: {score.teamB}</Typography>
        </Grid>
      </Grid>
      <Typography variant="h5">Timer: {timer.toFixed(3)} seconds</Typography>
      <Button variant="contained" color="primary" onClick={handleStart} disabled={isRunning}>
        Start Timer
      </Button>
      <Button variant="contained" color="secondary" onClick={handleStop} disabled={!isRunning}>
        Stop Timer
      </Button>
      <Button variant="contained" color="primary" onClick={handleCreateGame}>
        Create Game
      </Button>
    </div>
  );
};

export default App;

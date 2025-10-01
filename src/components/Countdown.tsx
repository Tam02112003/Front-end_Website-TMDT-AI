import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';

interface CountdownProps {
  releaseDate: string;
}

const Countdown = ({ releaseDate }: CountdownProps) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(releaseDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) {
      return;
    }

    timerComponents.push(
      <Box key={interval} sx={{ textAlign: 'center', p: 1 }}>
        <Typography variant="h6">{timeLeft[interval]}</Typography>
        <Typography variant="caption">{interval}</Typography>
      </Box>
    );
  });

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      {timerComponents.length ? timerComponents : <Typography variant="h6">Product Released!</Typography>}
    </Box>
  );
};

export default Countdown;

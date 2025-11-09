import React, { useState, useEffect } from 'react';

interface CountdownProps {
  deadline: string;
}

const Countdown: React.FC<CountdownProps> = ({ deadline }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(deadline) - +new Date();
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

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: React.ReactElement[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft] && timeLeft[interval as keyof typeof timeLeft] !== 0) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="flex flex-col items-center">
        <span className="text-2xl font-bold">{String(timeLeft[interval as keyof typeof timeLeft]).padStart(2, '0')}</span>
        <span className="text-xs uppercase text-muted-foreground">{interval}</span>
      </div>
    );
  });

  const isPastDeadline = timerComponents.length === 0;
  const deadlineDate = new Date(deadline);
  const timeColor = isPastDeadline ? 'text-destructive' : 'text-green-400';

  return (
    <div className={`p-4 rounded-lg bg-muted/50 border`}>
        <p className="text-sm text-center text-muted-foreground mb-2">
            Deadline: {deadlineDate.toLocaleString()}
        </p>
        {isPastDeadline ? (
            <div className="text-center font-bold text-destructive text-2xl">DEADLINE PASSED</div>
        ) : (
            <div className={`flex justify-around items-center ${timeColor}`}>
            {timerComponents}
            </div>
        )}
    </div>
  );
};

export default Countdown;
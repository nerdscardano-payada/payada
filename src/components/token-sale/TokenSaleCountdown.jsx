import React, { useState, useEffect } from "react";

function TimeBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-2 min-w-[56px] text-center font-mono text-2xl font-bold text-white">
        {String(value ?? 0).padStart(2, "0")}
      </div>
      <span className="text-white/40 text-xs mt-1">{label}</span>
    </div>
  );
}

export default function TokenSaleCountdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) return setTimeLeft({ ended: true });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  if (timeLeft.ended) {
    return <span className="text-red-400 font-semibold text-sm">Sale ended</span>;
  }

  return (
    <div className="flex items-end gap-2">
      <TimeBox value={timeLeft.days} label="Days" />
      <span className="text-white/40 text-2xl font-bold mb-3">:</span>
      <TimeBox value={timeLeft.hours} label="Hours" />
      <span className="text-white/40 text-2xl font-bold mb-3">:</span>
      <TimeBox value={timeLeft.minutes} label="Mins" />
      <span className="text-white/40 text-2xl font-bold mb-3">:</span>
      <TimeBox value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
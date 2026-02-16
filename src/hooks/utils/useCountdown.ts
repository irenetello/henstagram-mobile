import { useEffect, useState } from "react";

type Timestamp = {
  toDate?: () => Date;
  toMillis?: () => number;
};

export function useCountdown(endAt: Timestamp | null | undefined) {
  const [remaining, setRemaining] = useState<string>("");

  useEffect(() => {
    if (!endAt) {
      setRemaining("");
      return;
    }

    const getEndTime = () => {
      if (typeof endAt.toDate === "function") {
        return endAt.toDate().getTime();
      }
      if (typeof endAt.toMillis === "function") {
        return endAt.toMillis();
      }
      return 0;
    };

    const updateCountdown = () => {
      const endTime = getEndTime();
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setRemaining("Ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      let text = "";
      if (days > 0) text += `${days}d `;
      if (hours > 0) text += `${hours}h `;
      if (minutes > 0) text += `${minutes}m`;

      setRemaining(text.trim());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [endAt]);

  return remaining;
}

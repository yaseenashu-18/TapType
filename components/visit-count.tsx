"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { getVisitCount } from "@/lib/db/visits";

export function VisitCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getVisitCount()
      .then((val) => {
        if (active && val !== null) {
          setCount(val);
        }
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  if (count === null) {
    return null;
  }

  return (
    <span className="text-muted-foreground text-sm md:text-lg">
      <AnimatedNumber
        className="text-foreground tabular-nums"
        value={count}
      />{" "}
      <span className="hidden md:inline">thocks and </span>counting
    </span>
  );
}

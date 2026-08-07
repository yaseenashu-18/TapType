"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { getVisitCount } from "@/lib/db/visits";

export function VisitCount() {
  const [count, setCount] = useState<number>(0);

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

  return (
    <span className="text-muted-foreground/50 text-base md:text-lg">
      <AnimatedNumber
        className="font-medium text-foreground tabular-nums"
        value={count}
      />{" "}
      thocks and counting
    </span>
  );
}

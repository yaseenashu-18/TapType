"use client";

import { ClockCounterClockwise, Trash, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import useMediaQuery from "@/hooks/use-media-query";
import {
  clearStoredTestHistory,
  getStoredTestHistory,
  type SavedTestResult,
} from "@/lib/test-history";
import { cn } from "@/lib/utils";

interface HistoryDrawerProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function HistoryDrawer({ open, onOpenChange }: HistoryDrawerProps) {
  const [history, setHistory] = useState<SavedTestResult[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const swipe = isMobile ? "down" : "right";

  useEffect(() => {
    if (open) {
      setHistory(getStoredTestHistory());
    }
  }, [open]);

  const handleClear = () => {
    clearStoredTestHistory();
    setHistory([]);
  };

  const avgWpm =
    history.length > 0
      ? Math.round(history.reduce((acc, h) => acc + h.wpm, 0) / history.length)
      : 0;

  const topWpm =
    history.length > 0 ? Math.max(...history.map((h) => h.wpm)) : 0;

  const avgAccuracy =
    history.length > 0
      ? Math.round(
          history.reduce((acc, h) => acc + h.accuracy, 0) / history.length
        )
      : 0;

  const popupClass = cn(
    "h-full",
    isMobile
      ? "mx-3! mb-3! flex max-h-[90dvh] flex-col rounded-2xl! [--bleed:0px]"
      : "m-3! flex h-[calc(100%-1.5rem)]! flex-col rounded-2xl! [--bleed:0px]"
  );

  return (
    <Drawer onOpenChange={onOpenChange} open={open} swipeDirection={swipe}>
      <DrawerPopup className={popupClass}>
        <DrawerContent className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-border/40 border-b pb-4">
            <div className="flex items-center gap-2">
              <ClockCounterClockwise
                className="text-primary"
                size={18}
                weight="duotone"
              />
              <DrawerTitle className="font-semibold text-foreground text-sm">
                Session History
              </DrawerTitle>
            </div>
            <DrawerClose className="flex items-center justify-center rounded-full bg-foreground/[0.06] p-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground">
              <X size={14} />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-2 py-4 text-center">
            <div className="rounded-xl border border-foreground/5 bg-foreground/[0.02] p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Top WPM
              </p>
              <p className="font-bold font-mono text-lg text-primary">
                {topWpm}
              </p>
            </div>
            <div className="rounded-xl border border-foreground/5 bg-foreground/[0.02] p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Avg WPM
              </p>
              <p className="font-bold font-mono text-foreground text-lg">
                {avgWpm}
              </p>
            </div>
            <div className="rounded-xl border border-foreground/5 bg-foreground/[0.02] p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Avg Acc
              </p>
              <p className="font-bold font-mono text-foreground text-lg">
                {avgAccuracy}%
              </p>
            </div>
          </div>

          {/* List of recent sessions */}
          <div className="flex-1 space-y-2 overflow-y-auto py-2 pr-1">
            {history.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground/50 text-xs">
                <p>No typing session history yet.</p>
                <p className="text-[11px] opacity-70">
                  Complete a test to see your history!
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  className="flex items-center justify-between rounded-xl border border-foreground/5 bg-foreground/[0.02] px-3.5 py-2.5 transition-colors hover:bg-foreground/[0.04]"
                  key={item.id}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-base text-primary">
                        {item.wpm}{" "}
                        <span className="font-normal text-[11px] text-muted-foreground">
                          WPM
                        </span>
                      </span>
                      <span className="rounded-md bg-foreground/5 px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground">
                        {item.accuracy}% acc
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60">
                      {item.mode} {item.modeDetail} ·{" "}
                      {new Date(item.date).toLocaleDateString()}{" "}
                      {new Date(item.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-right font-mono text-muted-foreground/70 text-xs">
                    Raw: {item.raw}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {history.length > 0 && (
            <div className="flex justify-end border-border/40 border-t pt-4">
              <button
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-destructive text-xs transition-colors hover:bg-destructive/10"
                onClick={handleClear}
                type="button"
              >
                <Trash size={14} />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </DrawerContent>
      </DrawerPopup>
    </Drawer>
  );
}

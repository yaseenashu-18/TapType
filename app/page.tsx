"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppChrome } from "@/components/layout/app-chrome";
import { useSettings } from "@/components/settings/settings-provider";
import { TypingTest } from "@/components/typing/typing-test";
import { Keyboard } from "@/components/ui/keyboard";
import { cn } from "@/lib/utils";

export default function Page() {
  const { settingsOpen, setTypingActive, homeLogoHandlerRef } = useAppChrome();
  const [isFinished, setIsFinished] = useState(false);
  const [typingFocused, setTypingFocused] = useState(true);
  const [restartKey, setRestartKey] = useState(0);
  const { showKeyboard, soundEnabled, soundVolume, soundPack, accent } =
    useSettings();

  useEffect(() => {
    homeLogoHandlerRef.current = () => {
      setIsFinished(false);
      setRestartKey((k: number) => k + 1);
    };
    return () => {
      homeLogoHandlerRef.current = null;
    };
  }, [homeLogoHandlerRef]);

  const handleTypingActiveChange = useCallback(
    (active: boolean) => {
      setTypingActive(active);
    },
    [setTypingActive]
  );

  const handleKeyHighlight = useCallback((_key: string | null) => {
    /* no-op */
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <main
        className={cn(
          "flex flex-col px-6",
          isFinished
            ? "flex-1 justify-center px-10 py-2"
            : "flex-1 items-center justify-center"
        )}
      >
        <TypingTest
          key={restartKey}
          onFinished={setIsFinished}
          onFocusChange={setTypingFocused}
          onKeyHighlight={handleKeyHighlight}
          onTypingActiveChange={handleTypingActiveChange}
          pauseTypingInputRefocus={settingsOpen}
        />
      </main>

      {!isFinished && (
        <div className="pointer-events-none invisible h-0 overflow-hidden border-0">
          <Keyboard
            enableHaptics
            enableSound={soundEnabled}
            forceActive={soundEnabled}
            physicalKeysEnabled={true}
            soundPack={soundPack}
            theme={accent}
            volume={soundVolume}
          />
        </div>
      )}
    </div>
  );
}

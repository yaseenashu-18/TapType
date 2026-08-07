"use client";

import {
  ClockCounterClockwise,
  GearSix,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HistoryDrawer } from "@/components/history/history-drawer";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { useSettings } from "@/components/settings/settings-provider";
import { DynamicFavicon } from "@/components/theme/dynamic-favicon";
import { VisitCount } from "@/components/visit-count";
import { cn } from "@/lib/utils";

interface AppChromeContextValue {
  homeLogoHandlerRef: React.MutableRefObject<(() => void) | null>;
  setSettingsOpen: (open: boolean) => void;
  setTypingActive: (active: boolean) => void;
  settingsOpen: boolean;
  typingActive: boolean;
}

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function useAppChrome() {
  const ctx = useContext(AppChromeContext);
  if (!ctx) {
    throw new Error("useAppChrome must be used within AppChrome");
  }
  return ctx;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [typingActive, setTypingActive] = useState(false);
  const homeLogoHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore */
      });
    }
  }, []);

  // ⌘K to toggle settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSettingsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      settingsOpen,
      setSettingsOpen,
      typingActive,
      setTypingActive,
      homeLogoHandlerRef,
    }),
    [settingsOpen, typingActive]
  );

  return (
    <AppChromeContext.Provider value={value}>
      <DynamicFavicon />
      <div className="flex min-h-dvh w-full flex-col">
        <SiteHeader onOpenHistory={() => setHistoryOpen(true)} />
        {children}
      </div>
      <SettingsPanel onOpenChange={setSettingsOpen} open={settingsOpen} />
      <HistoryDrawer onOpenChange={setHistoryOpen} open={historyOpen} />
    </AppChromeContext.Provider>
  );
}

function SiteHeader({ onOpenHistory }: { onOpenHistory: () => void }) {
  const router = useRouter();
  const { setSettingsOpen, typingActive, homeLogoHandlerRef } = useAppChrome();
  const { soundEnabled, setSoundEnabled } = useSettings();

  const dimHeader = typingActive;

  const [mouseHeaderVisible, setMouseHeaderVisible] = useState(false);
  const headerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headerVisible = !typingActive || mouseHeaderVisible;

  useEffect(
    () => () => {
      if (headerTimerRef.current) {
        clearTimeout(headerTimerRef.current);
      }
    },
    []
  );

  const handleHeaderMouseMove = useCallback(() => {
    if (!typingActive) {
      return;
    }
    setMouseHeaderVisible(true);
    if (headerTimerRef.current) {
      clearTimeout(headerTimerRef.current);
    }
    headerTimerRef.current = setTimeout(
      () => setMouseHeaderVisible(false),
      2500
    );
  }, [typingActive]);

  function handleLogoClick() {
    if (homeLogoHandlerRef.current) {
      homeLogoHandlerRef.current();
      return;
    }
    router.push("/");
  }

  const headerOpacity = dimHeader ? (headerVisible ? 1 : 0.1) : 1;

  return (
    <motion.header
      animate={{ opacity: headerOpacity }}
      className="flex shrink-0 justify-center px-6 py-4 md:px-10 md:py-5"
      onMouseMove={handleHeaderMouseMove}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="relative flex w-full max-w-5xl flex-wrap items-center justify-between">
        {/* Left — Brand Name */}
        <button
          aria-label="TapType Home"
          className="flex cursor-pointer items-center font-bold text-foreground text-xl tracking-tight transition-transform active:scale-95"
          onClick={handleLogoClick}
          type="button"
        >
          TapType
        </button>

        {/* Center — Visit counter */}
        <div className="pointer-events-none order-last mt-2 flex w-full justify-center md:absolute md:inset-x-0 md:order-none md:mt-0 md:w-auto">
          <VisitCount />
        </div>

        {/* Right — Audio, Settings, History */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <motion.button
            aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
            className={cn(
              "flex items-center gap-1.5 rounded-full bg-foreground/[0.05] px-3 py-1.5 text-[13px] transition-colors duration-150",
              soundEnabled
                ? "text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground"
                : "text-muted-foreground/35 hover:bg-foreground/[0.06] hover:text-muted-foreground"
            )}
            onClick={() => setSoundEnabled(!soundEnabled)}
            type="button"
            whileTap={{ scale: 0.97 }}
          >
            <motion.span
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex"
              initial={{ scale: 0.6, opacity: 0 }}
              key={String(soundEnabled)}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {soundEnabled ? (
                <SpeakerHigh size={15} weight="duotone" />
              ) : (
                <SpeakerSlash size={15} weight="duotone" />
              )}
            </motion.span>
            <span className="hidden sm:inline">Audio</span>
          </motion.button>

          {/* Settings */}
          <motion.button
            aria-label="Settings"
            className="flex items-center gap-1.5 rounded-full bg-foreground/[0.05] px-3 py-1.5 text-[13px] text-muted-foreground transition-all duration-200 hover:bg-foreground/[0.08] hover:text-foreground active:scale-95"
            onClick={() => setSettingsOpen(true)}
            type="button"
            whileTap={{ scale: 0.94 }}
          >
            <GearSix size={15} weight="duotone" />
            <span className="hidden sm:inline">Settings</span>
          </motion.button>

          {/* History — primary pill */}
          <motion.button
            aria-label="History"
            className="flex cursor-pointer items-center gap-2 rounded-full bg-foreground px-4 py-1.5 font-medium text-[13px] text-background transition-transform active:scale-95"
            onClick={onOpenHistory}
            type="button"
            whileTap={{ scale: 0.96 }}
          >
            <ClockCounterClockwise size={15} weight="duotone" />
            <span className="hidden sm:inline">History</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

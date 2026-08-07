"use client";

import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { useWebHaptics } from "web-haptics/react";
import { getSoundBuffer } from "@/lib/audio-preloader";
import type { KeyboardLayout } from "@/lib/keyboard-layouts";
import { SOUND_DEFINES_DOWN, SOUND_DEFINES_UP } from "./sound";
import type {
  KeyboardEventPhase,
  KeyboardEventSource,
  KeyboardInteractionEvent,
  KeyboardThemeName,
} from "./types";

// -----------------------------------------------------------------------------
// Internal keyboard context
// -----------------------------------------------------------------------------

interface KeyboardContextType {
  lastPressedKey: string | null;
  layout: KeyboardLayout;
  pressedKeys: Set<string>;
  pressKey: (keyCode: string, source: KeyboardEventSource) => boolean;
  releaseAllKeys: (source?: KeyboardEventSource) => void;
  releaseKey: (keyCode: string, source: KeyboardEventSource) => void;
  themeName: KeyboardThemeName;
  triggerPointerHaptic: () => void;
}

export const KeyboardContext = createContext<KeyboardContextType | null>(null);

/** OS/browsers often skip keyup for the letter key after Meta/Cmd chords; we track modifiers to clear orphans. */
export const PHYSICAL_MODIFIER_CODES = new Set<string>([
  "AltLeft",
  "AltRight",
  "ControlLeft",
  "ControlRight",
  "MetaLeft",
  "MetaRight",
  "ShiftLeft",
  "ShiftRight",
]);

export function useKeyboardContext() {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error("Keyboard components must be used within KeyboardProvider");
  }
  return context;
}

export interface KeyboardProviderProps {
  children: ReactNode;
  containerRef: RefObject<HTMLDivElement | null>;
  enableHaptics: boolean;
  enableSound: boolean;
  forceActive?: boolean;
  layout: KeyboardLayout;
  onKeyEvent?: (event: KeyboardInteractionEvent) => void;
  physicalKeysEnabled?: boolean;
  soundPack?: string;
  soundUrl: string;
  theme: KeyboardThemeName;
  volume?: number;
}

export function KeyboardProvider({
  children,
  containerRef,
  theme,
  enableSound,
  enableHaptics,
  soundUrl,
  soundPack = "classic",
  onKeyEvent,
  forceActive = false,
  physicalKeysEnabled = true,
  layout,
  volume = 0.5,
}: KeyboardProviderProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const modifiersDownRef = useRef<Set<string>>(new Set());
  const { trigger } = useWebHaptics();

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!(enableSound && soundUrl)) {
      audioBufferRef.current = null;
      return;
    }

    let cancelled = false;
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    // getSoundBuffer() returns the pre-fetched ArrayBuffer (started at module import time).
    // By the time the component mounts, the fetch is usually already complete.
    getSoundBuffer()
      .then((ab) => (ab ? audioContext.decodeAudioData(ab.slice(0)) : null))
      .then((decoded) => {
        if (!cancelled && decoded) {
          audioBufferRef.current = decoded;
        }
      })
      .catch(() => {
        // Sound is optional. Keep UI interactive if loading fails.
      });

    // Resume on first user interaction (browsers suspend new AudioContexts)
    const resume = () => {
      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }
    };
    document.addEventListener("keydown", resume, { once: true });
    document.addEventListener("pointerdown", resume, { once: true });

    return () => {
      cancelled = true;
      audioBufferRef.current = null;
      audioContextRef.current = null;
      document.removeEventListener("keydown", resume);
      document.removeEventListener("pointerdown", resume);
      void audioContext.close();
    };
  }, [enableSound, soundUrl]);

  const soundPackRef = useRef(soundPack);
  useEffect(() => {
    soundPackRef.current = soundPack;
  }, [soundPack]);

  const playSound = useCallback(
    (phase: KeyboardEventPhase, keyCode: string) => {
      if (!enableSound) {
        return;
      }

      const audioContext = audioContextRef.current;
      const audioBuffer = audioBufferRef.current;
      if (!(audioContext && audioBuffer)) {
        return;
      }

      const soundDef =
        phase === "down"
          ? SOUND_DEFINES_DOWN[keyCode]
          : SOUND_DEFINES_UP[keyCode];
      if (!soundDef) {
        return;
      }

      const [startMs, durationMs] = soundDef;

      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      const gain = audioContext.createGain();
      gain.gain.value = volume;

      const sp = soundPackRef.current ?? soundPack;

      // Apply sound pack DSP audio effects & pitch modifications
      if (sp === "thock") {
        source.playbackRate.value = 0.78;
        source.detune.value = -450;
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 380;
        source.connect(filter).connect(gain).connect(audioContext.destination);
      } else if (sp === "clicky") {
        source.playbackRate.value = 1.22;
        source.detune.value = 400;
        const filter = audioContext.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 1600;
        filter.Q.value = 3;
        source.connect(filter).connect(gain).connect(audioContext.destination);
      } else if (sp === "creamy") {
        source.playbackRate.value = 1.08;
        source.detune.value = 180;
        const filter = audioContext.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1050;
        filter.Q.value = 2.5;
        source.connect(filter).connect(gain).connect(audioContext.destination);
      } else if (sp === "typewriter") {
        source.playbackRate.value = 0.88;
        source.detune.value = -280;
        const filter = audioContext.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = 750;
        filter.Q.value = 4;
        filter.gain.value = 8;
        source.connect(filter).connect(gain).connect(audioContext.destination);
      } else if (sp === "cyberpunk") {
        source.playbackRate.value = 1.38;
        source.detune.value = 700;
        const filter = audioContext.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 1400;
        filter.Q.value = 4;
        source.connect(filter).connect(gain).connect(audioContext.destination);
      } else {
        source.playbackRate.value = 1.0;
        source.detune.value = 0;
        source.connect(gain).connect(audioContext.destination);
      }

      source.start(0, startMs / 1000, durationMs / 1000);
    },
    [enableSound, volume, soundPack]
  );

  const emitKeyEvent = useCallback(
    (phase: KeyboardEventPhase, code: string, source: KeyboardEventSource) => {
      onKeyEvent?.({ code, phase, source });
    },
    [onKeyEvent]
  );

  const triggerPointerHaptic = useCallback(() => {
    if (!enableHaptics) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      "navigator" in window &&
      typeof navigator.vibrate === "function"
    ) {
      try {
        navigator.vibrate(15);
      } catch {
        /* ignore */
      }
    }

    void trigger([{ duration: 25 }], { intensity: 0.7 });
  }, [enableHaptics, trigger]);

  const pressKey = useCallback(
    (keyCode: string, source: KeyboardEventSource): boolean => {
      if (pressedKeysRef.current.has(keyCode)) {
        return false;
      }

      const apply = () => {
        const next = new Set(pressedKeysRef.current);
        next.add(keyCode);
        pressedKeysRef.current = next;
        setPressedKeys(next);
        setLastPressedKey(keyCode);
        playSound("down", keyCode);
        triggerPointerHaptic();
        emitKeyEvent("down", keyCode, source);
      };

      if (source === "pointer") {
        flushSync(apply);
      } else {
        apply();
      }

      return true;
    },
    [emitKeyEvent, playSound, triggerPointerHaptic]
  );

  const releaseKey = useCallback(
    (keyCode: string, source: KeyboardEventSource) => {
      if (!pressedKeysRef.current.has(keyCode)) {
        return;
      }

      const apply = () => {
        const next = new Set(pressedKeysRef.current);
        next.delete(keyCode);
        pressedKeysRef.current = next;
        setPressedKeys(next);
        playSound("up", keyCode);
        emitKeyEvent("up", keyCode, source);
      };

      if (source === "pointer") {
        flushSync(apply);
      } else {
        apply();
      }
    },
    [emitKeyEvent, playSound]
  );

  const releaseAllKeys = useCallback(
    (source: KeyboardEventSource = "physical") => {
      const keysToRelease = Array.from(pressedKeysRef.current);
      if (keysToRelease.length === 0) {
        return;
      }

      pressedKeysRef.current = new Set();
      modifiersDownRef.current = new Set();
      setPressedKeys(new Set());

      for (const keyCode of keysToRelease) {
        emitKeyEvent("up", keyCode, source);
      }
    },
    [emitKeyEvent]
  );

  useEffect(() => {
    const handleBlur = () => {
      releaseAllKeys();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        releaseAllKeys();
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [releaseAllKeys]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  useEffect(() => {
    if (!(isVisible || forceActive)) {
      return;
    }
    if (!physicalKeysEnabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (PHYSICAL_MODIFIER_CODES.has(event.code)) {
        modifiersDownRef.current.add(event.code);
      }
      if (event.repeat) {
        return;
      }
      pressKey(event.code, "physical");
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const code = event.code;
      releaseKey(code, "physical");

      if (!PHYSICAL_MODIFIER_CODES.has(code)) {
        return;
      }

      const hadTracked = modifiersDownRef.current.delete(code);
      if (!hadTracked || modifiersDownRef.current.size > 0) {
        return;
      }

      for (const stuckCode of Array.from(pressedKeysRef.current)) {
        if (!PHYSICAL_MODIFIER_CODES.has(stuckCode)) {
          releaseKey(stuckCode, "physical");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isVisible, forceActive, physicalKeysEnabled, pressKey, releaseKey]);

  return (
    <KeyboardContext.Provider
      value={{
        themeName: theme,
        layout,
        pressedKeys,
        lastPressedKey,
        triggerPointerHaptic,
        pressKey,
        releaseKey,
        releaseAllKeys,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
}

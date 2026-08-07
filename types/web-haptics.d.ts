declare module "web-haptics/react" {
  export interface HapticPattern {
    delay?: number;
    duration?: number;
    intensity?: number;
  }

  export interface HapticOptions {
    intensity?: number;
  }

  export function useWebHaptics(): {
    trigger: (
      pattern?: HapticPattern | HapticPattern[],
      options?: HapticOptions
    ) => Promise<void>;
    stop: () => void;
    isSupported: boolean;
  };
}

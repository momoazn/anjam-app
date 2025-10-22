import { useCallback, useRef } from "react";

type NotificationSoundType = "success" | "warning" | "info";

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

class NotificationSounds {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = false;

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      await this.loadSounds();
    } catch (error) {
      console.warn("Audio context not supported:", error);
    }
  }

  private async loadSounds() {
    if (!this.audioContext) return;

    // For now, we'll create simple beep sounds programmatically
    // In a real app, you'd load actual audio files
    const sounds: Record<
      NotificationSoundType,
      (context: AudioContext) => AudioBuffer
    > = {
      success: this.createSuccessSound,
      warning: this.createWarningSound,
      info: this.createInfoSound,
    };

    for (const [type, createSound] of Object.entries(sounds)) {
      try {
        const buffer = createSound(this.audioContext);
        this.sounds.set(type, buffer);
      } catch (error) {
        console.warn(`Failed to create ${type} sound:`, error);
      }
    }
  }

  private createSuccessSound(context: AudioContext): AudioBuffer {
    const duration = 0.3;
    const sampleRate = context.sampleRate;
    const frameCount = duration * sampleRate;
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create a pleasant ascending tone
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      const frequency = 440 + (880 - 440) * (t / duration); // 440Hz to 880Hz
      channelData[i] =
        Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.3;
    }

    return buffer;
  }

  private createWarningSound(context: AudioContext): AudioBuffer {
    const duration = 0.5;
    const sampleRate = context.sampleRate;
    const frameCount = duration * sampleRate;
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create a warning beep
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      channelData[i] = Math.sin(2 * Math.PI * 660 * t) * Math.exp(-t * 2) * 0.2;
    }

    return buffer;
  }

  private createInfoSound(context: AudioContext): AudioBuffer {
    const duration = 0.2;
    const sampleRate = context.sampleRate;
    const frameCount = duration * sampleRate;
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create a simple notification beep
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      channelData[i] =
        Math.sin(2 * Math.PI * 523.25 * t) * Math.exp(-t * 5) * 0.25; // C note
    }

    return buffer;
  }

  async playSound(type: NotificationSoundType, options: SoundOptions = {}) {
    if (
      !this.enabled ||
      !this.audioContext ||
      this.audioContext.state === "suspended"
    ) {
      return;
    }

    const buffer = this.sounds.get(type);
    if (!buffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = options.volume ?? 0.5;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn(`Failed to play ${type} sound:`, error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (this.audioContext?.state === "suspended") {
        await this.audioContext.resume();
      }
      return true;
    } catch (error) {
      console.warn("Failed to get audio permission:", error);
      return false;
    }
  }
}

// Singleton instance
const notificationSounds = new NotificationSounds();

export function useNotificationSounds() {
  const initialized = useRef(false);

  const initialize = useCallback(async () => {
    if (!initialized.current) {
      await notificationSounds.initialize();
      initialized.current = true;
    }
  }, []);

  const playSound = useCallback(
    async (type: NotificationSoundType, options?: SoundOptions) => {
      await initialize();
      await notificationSounds.playSound(type, options);
    },
    [initialize],
  );

  const setEnabled = useCallback((enabled: boolean) => {
    notificationSounds.setEnabled(enabled);
  }, []);

  const isEnabled = useCallback(() => {
    return notificationSounds.isEnabled();
  }, []);

  const requestPermission = useCallback(async () => {
    return await notificationSounds.requestPermission();
  }, []);

  return {
    playSound,
    setEnabled,
    isEnabled,
    requestPermission,
    initialize,
  };
}

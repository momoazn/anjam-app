// Simple sound manager for notifications
// Uses Web Audio API to create a basic notification sound

class NotificationSoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = false;
  private readonly volume = 0.3; // Fixed volume

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && this.audioContext?.state === "suspended") {
      this.audioContext?.resume();
    }
  }

  private createTone(frequency: number, duration: number): AudioBuffer {
    if (!this.audioContext) {
      throw new Error("Audio context not initialized");
    }

    const sampleRate = this.audioContext.sampleRate;
    const frameCount = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * t);

      // Apply envelope for smooth sound
      const attackTime = 0.01;
      const decayTime = duration - attackTime;
      let envelope = 1;

      if (t < attackTime) {
        envelope = t / attackTime; // Attack
      } else if (t > decayTime) {
        envelope = 1 - (t - decayTime) / (duration - decayTime); // Decay
      }

      channelData[i] = sample * envelope * this.volume;
    }

    return buffer;
  }

  async playSound() {
    if (!this.enabled || !this.audioContext) {
      return;
    }

    try {
      // Single neutral notification tone
      const buffer = this.createTone(440, 0.2); // A4

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn("Failed to play notification sound:", error);
    }
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
export const notificationSoundManager = new NotificationSoundManager();

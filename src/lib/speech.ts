// Shared helpers for browser Speech Synthesis + Microphone permission handling.
// Fixes two common mobile issues:
//  1. speechSynthesis.getVoices() returns [] on first call — we must wait for
//     the `voiceschanged` event (or a short poll) before selecting a voice,
//     otherwise mobile browsers pick a wrong/silent voice and appear "denied".
//  2. getUserMedia rejects with NotAllowedError once the user (or browser
//     setting / preview iframe) blocks the mic. We surface a clear, actionable
//     message instead of a generic "denied" toast.

export const isSpeechSynthesisSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export const isSpeechRecognitionSupported = (): boolean =>
  typeof window !== "undefined" &&
  Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

/** Wait until the browser's voice list is populated (or timeout). */
export const ensureVoicesLoaded = (timeoutMs = 2000): Promise<SpeechSynthesisVoice[]> =>
  new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) return resolve([]);
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length > 0) return resolve(existing);

    let settled = false;
    const done = (voices: SpeechSynthesisVoice[]) => {
      if (settled) return;
      settled = true;
      synth.onvoiceschanged = null;
      resolve(voices);
    };

    synth.onvoiceschanged = () => done(synth.getVoices());

    // Fallback poll — some browsers never fire voiceschanged.
    const start = Date.now();
    const poll = () => {
      const v = synth.getVoices();
      if (v.length > 0) return done(v);
      if (Date.now() - start > timeoutMs) return done([]);
      setTimeout(poll, 100);
    };
    setTimeout(poll, 150);
  });

const scoreVoice = (v: SpeechSynthesisVoice, targetLang: string): number => {
  const n = v.name.toLowerCase();
  let s = 0;
  if (v.lang.toLowerCase() === targetLang.toLowerCase()) s += 5;
  if (n.includes("google")) s += 4;
  if (n.includes("natural") || n.includes("neural") || n.includes("online")) s += 4;
  if (n.includes("microsoft")) s += 3;
  if (
    n.includes("female") || n.includes("aria") || n.includes("jenny") ||
    n.includes("neerja") || n.includes("swara") || n.includes("heera")
  ) s += 2;
  if (!v.localService) s += 1;
  return s;
};

export const pickBestVoice = (
  voices: SpeechSynthesisVoice[],
  langCode: string,
): SpeechSynthesisVoice | undefined => {
  const base = langCode.split("-")[0];
  const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(base));
  return (
    [...langVoices].sort((a, b) => scoreVoice(b, langCode) - scoreVoice(a, langCode))[0] ||
    voices.find((v) => v.lang.toLowerCase().startsWith("en"))
  );
};

export interface SpeakOptions {
  langCode: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (msg: string) => void;
}

/**
 * Speak text using the best available voice. Must be called from a user gesture
 * on mobile browsers. Returns the utterance (or null if not supported).
 */
export const speakText = async (
  text: string,
  opts: SpeakOptions,
): Promise<SpeechSynthesisUtterance | null> => {
  if (!isSpeechSynthesisSupported()) {
    opts.onError?.("Text-to-speech is not supported in this browser.");
    return null;
  }
  const synth = window.speechSynthesis;
  // iOS Safari needs an explicit cancel before a new speak call.
  synth.cancel();

  const voices = await ensureVoicesLoaded();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = opts.langCode;
  utterance.rate = opts.rate ?? 0.95;
  utterance.pitch = opts.pitch ?? 1.05;
  utterance.volume = opts.volume ?? 1;

  const voice = pickBestVoice(voices, opts.langCode);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  utterance.onstart = () => opts.onStart?.();
  utterance.onend = () => opts.onEnd?.();
  utterance.onerror = (e) => {
    const err = (e as SpeechSynthesisErrorEvent).error;
    let msg = "Could not play voice.";
    if (err === "not-allowed" || err === "audio-busy") {
      msg = "Voice playback was blocked. Tap the speaker again after any sound is playing.";
    } else if (err === "language-unavailable" || err === "voice-unavailable") {
      msg = "No voice installed for this language on your device.";
    } else if (err === "synthesis-failed" || err === "synthesis-unavailable") {
      msg = "Your browser could not generate speech. Try Chrome or Edge.";
    } else if (err === "network") {
      msg = "Voice download failed — check your internet connection.";
    }
    opts.onError?.(msg);
  };

  // Some mobile browsers pause on backgrounding; make sure it's running.
  try { synth.resume(); } catch {}
  synth.speak(utterance);
  return utterance;
};

export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
};

/** Ask for mic permission with helpful, specific error messages. */
export const requestMicPermission = async (): Promise<
  { ok: true; stream: MediaStream } | { ok: false; message: string }
> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, message: "Microphone is not supported in this browser." };
  }
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return {
      ok: false,
      message: "Microphone needs a secure (https://) connection. Open the published site.",
    };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 48000,
      } as MediaTrackConstraints,
    });
    return { ok: true, stream };
  } catch (err: any) {
    const name = err?.name || "";
    let message = "Could not access the microphone.";
    if (name === "NotAllowedError" || name === "SecurityError") {
      message =
        "Mic access is blocked. Open your browser's site settings, allow the microphone for this site, then reload.";
    } else if (name === "NotFoundError" || name === "OverconstrainedError") {
      message = "No microphone was found on this device.";
    } else if (name === "NotReadableError") {
      message = "Another app is using the microphone. Close it and try again.";
    }
    return { ok: false, message };
  }
};

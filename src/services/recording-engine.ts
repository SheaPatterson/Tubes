/**
 * Recording Engine Service
 *
 * Captures the final Signal_Chain audio output using the MediaRecorder API.
 * Supports WAV, MP3, and FLAC formats at configurable sample rates and bit depths.
 * Provides elapsed time tracking and waveform visualization data.
 *
 * Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6
 */

// ── Types ──

export interface RecordingOptions {
  format: 'wav' | 'mp3' | 'flac';
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
  outputPath?: string; // Electron only
}

export interface RecordingResult {
  blob: Blob;
  duration: number;
  format: string;
  sampleRate: number;
  bitDepth: number;
}

export interface RecordingEngine {
  startRecording(options: RecordingOptions): void;
  stopRecording(): Promise<RecordingResult>;
  isRecording(): boolean;
  getElapsedTime(): number;
  getWaveformData(): Float32Array;
}

export type RecordingErrorCallback = (error: RecordingError) => void;

export interface RecordingError {
  type: 'format_unsupported' | 'recorder_error' | 'no_source' | 'not_recording';
  message: string;
}

// ── Constants ──

const WAVEFORM_FFT_SIZE = 2048;

const FORMAT_MIME_MAP: Record<string, string[]> = {
  wav: ['audio/wav', 'audio/wave', 'audio/webm'],
  mp3: ['audio/mpeg', 'audio/mp3', 'audio/webm;codecs=opus'],
  flac: ['audio/flac', 'audio/webm;codecs=opus', 'audio/webm'],
};

const FORMAT_FALLBACK_MIME = 'audio/webm';

// ── Helpers ──

/**
 * Resolve the best MIME type for the requested format that the browser supports.
 * Falls back to 'audio/webm' if none of the preferred types are supported.
 */
export function resolveMimeType(format: RecordingOptions['format']): string {
  if (typeof MediaRecorder === 'undefined') {
    return FORMAT_FALLBACK_MIME;
  }

  const candidates = FORMAT_MIME_MAP[format] ?? [FORMAT_FALLBACK_MIME];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return FORMAT_FALLBACK_MIME;
}

/**
 * Map a MIME type back to a user-facing format string.
 */
function mimeToFormat(mime: string): string {
  if (mime.includes('wav') || mime.includes('wave')) return 'wav';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  if (mime.includes('flac')) return 'flac';
  if (mime.includes('webm')) return 'webm';
  return 'unknown';
}

/**
 * Validate that the given options contain supported values.
 */
export function validateRecordingOptions(options: RecordingOptions): RecordingError | null {
  const validSampleRates = [44100, 48000, 96000];
  const validBitDepths = [16, 24, 32];
  const validFormats = ['wav', 'mp3', 'flac'];

  if (!validFormats.includes(options.format)) {
    return {
      type: 'format_unsupported',
      message: `Unsupported format "${options.format}". Supported: wav, mp3, flac.`,
    };
  }
  if (!validSampleRates.includes(options.sampleRate)) {
    return {
      type: 'format_unsupported',
      message: `Unsupported sample rate ${options.sampleRate}. Supported: 44100, 48000, 96000.`,
    };
  }
  if (!validBitDepths.includes(options.bitDepth)) {
    return {
      type: 'format_unsupported',
      message: `Unsupported bit depth ${options.bitDepth}. Supported: 16, 24, 32.`,
    };
  }
  return null;
}

// ── Implementation ──

export function createRecordingEngine(sourceNode?: AudioNode): RecordingEngine {
  // State
  let recording = false;
  let startTime = 0;
  let elapsedTime = 0;
  let timerHandle: ReturnType<typeof setInterval> | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let currentOptions: RecordingOptions | null = null;
  let resolveStop: ((result: RecordingResult) => void) | null = null;
  let rejectStop: ((error: Error) => void) | null = null;

  // Audio analysis for waveform visualization
  let analyserNode: AnalyserNode | null = null;
  let mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;
  let waveformBuffer: Float32Array = new Float32Array(WAVEFORM_FFT_SIZE);

  /**
   * Set up the AnalyserNode for waveform data capture.
   * Connects sourceNode → analyserNode → mediaStreamDestination.
   */
  function setupAnalyser(source: AudioNode): void {
    const ctx = source.context;

    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = WAVEFORM_FFT_SIZE;
    analyserNode.smoothingTimeConstant = 0.8;

    mediaStreamDestination = ctx.createMediaStreamDestination();

    source.connect(analyserNode);
    analyserNode.connect(mediaStreamDestination);

    waveformBuffer = new Float32Array(analyserNode.fftSize);
  }

  /**
   * Tear down audio graph connections.
   */
  function teardownAnalyser(source: AudioNode | undefined): void {
    if (analyserNode && source) {
      try {
        source.disconnect(analyserNode);
      } catch {
        // Already disconnected
      }
    }
    if (analyserNode && mediaStreamDestination) {
      try {
        analyserNode.disconnect(mediaStreamDestination);
      } catch {
        // Already disconnected
      }
    }
    analyserNode = null;
    mediaStreamDestination = null;
  }

  /**
   * Start the elapsed time timer using setInterval (1ms resolution is fine;
   * actual elapsed is computed from Date.now delta).
   */
  function startTimer(): void {
    startTime = Date.now();
    elapsedTime = 0;
    timerHandle = setInterval(() => {
      elapsedTime = (Date.now() - startTime) / 1000;
    }, 50); // Update ~20 times/sec for smooth UI
  }

  function stopTimer(): void {
    if (timerHandle !== null) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
    elapsedTime = (Date.now() - startTime) / 1000;
  }

  // ── Public API ──

  const engine: RecordingEngine = {
    startRecording(options: RecordingOptions): void {
      if (recording) {
        throw new Error('Already recording. Stop the current recording first.');
      }

      const validationError = validateRecordingOptions(options);
      if (validationError) {
        throw new Error(validationError.message);
      }

      if (!sourceNode) {
        throw new Error('No audio source node provided. Cannot start recording.');
      }

      currentOptions = { ...options };
      chunks = [];

      // Set up audio analysis graph
      setupAnalyser(sourceNode);

      if (!mediaStreamDestination) {
        throw new Error('Failed to create media stream destination.');
      }

      // Resolve MIME type for the requested format
      const mimeType = resolveMimeType(options.format);

      // Create MediaRecorder from the destination stream
      try {
        mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
          mimeType,
        });
      } catch {
        // If the resolved MIME type isn't supported, try without specifying
        mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      }

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopTimer();

        const actualMime = mediaRecorder?.mimeType ?? mimeType;
        const blob = new Blob(chunks, { type: actualMime });

        const result: RecordingResult = {
          blob,
          duration: elapsedTime,
          format: mimeToFormat(actualMime),
          sampleRate: currentOptions?.sampleRate ?? 44100,
          bitDepth: currentOptions?.bitDepth ?? 16,
        };

        // Clean up
        teardownAnalyser(sourceNode);
        recording = false;
        mediaRecorder = null;
        chunks = [];

        if (resolveStop) {
          resolveStop(result);
          resolveStop = null;
          rejectStop = null;
        }
      };

      mediaRecorder.onerror = () => {
        stopTimer();
        teardownAnalyser(sourceNode);
        recording = false;

        const error = new Error('MediaRecorder encountered an error during recording.');
        if (rejectStop) {
          rejectStop(error);
          resolveStop = null;
          rejectStop = null;
        }

        mediaRecorder = null;
        chunks = [];
      };

      // Request data every 250ms for responsive stop behavior (< 2s save target)
      mediaRecorder.start(250);
      recording = true;
      startTimer();
    },

    stopRecording(): Promise<RecordingResult> {
      return new Promise<RecordingResult>((resolve, reject) => {
        if (!recording || !mediaRecorder) {
          reject(new Error('Not currently recording.'));
          return;
        }

        resolveStop = resolve;
        rejectStop = reject;

        // Request any remaining data and stop
        mediaRecorder.stop();
      });
    },

    isRecording(): boolean {
      return recording;
    },

    getElapsedTime(): number {
      return elapsedTime;
    },

    getWaveformData(): Float32Array {
      if (analyserNode && recording) {
        analyserNode.getFloatTimeDomainData(waveformBuffer);
      }
      return waveformBuffer;
    },
  };

  return engine;
}

import { SCENE_KINDS, type SceneKind } from '../domain/scenes'
import { bandFor, SOUND_SCHEDULE, type SoundType } from './ambientSounds'

interface FilterConfig {
  inputType: BiquadFilterType
  inputFreq: number
  outputType: BiquadFilterType
  outputFreq: number
  q?: number
  /** Slow LFO on the output filter's cutoff — swell/whistle motion instead of a static tone. */
  lfo?: boolean
}

/**
 * Just the ambient BED now — a quiet, mostly-unchanging texture underneath the real time-of-day
 * signal (see ambientSounds.ts). A filter cutoff moving a few hundred Hz is not something a human
 * ear reads as "morning" vs "midnight"; the discrete scheduled sounds are.
 */
const FILTER_CONFIG: Record<SceneKind, FilterConfig> = {
  rain: { inputType: 'highpass', inputFreq: 900, outputType: 'lowpass', outputFreq: 7000 },
  ocean: { inputType: 'lowpass', inputFreq: 450, outputType: 'bandpass', outputFreq: 1500, q: 0.7, lfo: true },
  lake: { inputType: 'lowpass', inputFreq: 500, outputType: 'bandpass', outputFreq: 750, q: 0.8 },
  city: { inputType: 'lowpass', inputFreq: 260, outputType: 'bandpass', outputFreq: 1300, q: 0.6 },
  desert: { inputType: 'lowpass', inputFreq: 600, outputType: 'bandpass', outputFreq: 1500, q: 0.9, lfo: true },
  mountain: { inputType: 'lowpass', inputFreq: 550, outputType: 'bandpass', outputFreq: 1300, q: 0.9, lfo: true },
  forest: { inputType: 'bandpass', inputFreq: 900, outputType: 'bandpass', outputFreq: 1200, q: 0.6 },
  aurora: { inputType: 'lowpass', inputFreq: 380, outputType: 'bandpass', outputFreq: 1500, q: 1.0, lfo: true },
}

/** Bed gain when a scene is active — quiet enough that the scheduled feature sounds (birds,
 * crickets, traffic, waves...) read as the foreground, not just more wind. */
const BED_GAIN = 0.4

interface Bed {
  gain: GainNode
  outFilter: BiquadFilterNode
  baseOutFreq: number
}

interface SolarSnapshot {
  elevation: number
  hourAngle: number
}

interface EngineHooks {
  getActiveKind: () => SceneKind | undefined
  getActiveSolar: () => SolarSnapshot | undefined
}

function makeNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.05 * white) / 1.05
    data[i] = last * 3.2
  }
  return buffer
}

/**
 * Module-level singleton: the audio graph is built exactly once (lazily, only from the mute
 * button's click handler, to respect the browser's autoplay gesture requirement) and never
 * recreated on React re-render — React only ever calls methods on this one instance.
 */
export class AmbientAudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private beds: Partial<Record<SceneKind, Bed>> = {}
  private featureTimer: ReturnType<typeof setTimeout> | null = null
  private activeKind: SceneKind | null = null
  private hooks: EngineHooks | null = null

  init(hooks: EngineHooks): void {
    this.hooks = hooks
    if (this.ctx) return

    const ctx = new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    this.ctx = ctx

    const masterGain = ctx.createGain()
    masterGain.gain.value = 0
    masterGain.connect(ctx.destination)
    this.masterGain = masterGain

    const noiseBuffer = makeNoiseBuffer(ctx)
    this.noiseBuffer = noiseBuffer

    for (const kind of SCENE_KINDS) {
      const cfg = FILTER_CONFIG[kind]
      const src = ctx.createBufferSource()
      src.buffer = noiseBuffer
      src.loop = true

      const inputFilter = ctx.createBiquadFilter()
      inputFilter.type = cfg.inputType
      inputFilter.frequency.value = cfg.inputFreq

      const outputFilter = ctx.createBiquadFilter()
      outputFilter.type = cfg.outputType
      outputFilter.frequency.value = cfg.outputFreq
      if (cfg.q) outputFilter.Q.value = cfg.q

      if (cfg.lfo) {
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 0.06
        const lfoGain = ctx.createGain()
        lfoGain.gain.value = cfg.outputFreq * 0.35
        lfo.connect(lfoGain)
        lfoGain.connect(outputFilter.frequency)
        lfo.start()
      }

      const gain = ctx.createGain()
      gain.gain.value = 0

      src.connect(inputFilter)
      inputFilter.connect(outputFilter)
      outputFilter.connect(gain)
      gain.connect(masterGain)
      src.start()

      this.beds[kind] = { gain, outFilter: outputFilter, baseOutFreq: cfg.outputFreq }
    }

    this.scheduleFeatureSounds()
  }

  setMuted(muted: boolean): void {
    if (!this.ctx || !this.masterGain) return
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now)
    this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.8, now + 0.5)
    if (!muted) {
      const kind = this.hooks?.getActiveKind()
      if (kind) this.setActiveScene(kind)
      this.playConfirmBlip()
    }
  }

  /** Crossfades the currently-audible scene bed — called on active city/scene changes. */
  setActiveScene(kind: SceneKind): void {
    if (!this.ctx) return
    this.activeKind = kind
    const now = this.ctx.currentTime
    for (const [k, bed] of Object.entries(this.beds) as [SceneKind, Bed | undefined][]) {
      if (!bed) continue
      bed.gain.gain.cancelScheduledValues(now)
      bed.gain.gain.setValueAtTime(bed.gain.gain.value, now)
      bed.gain.gain.linearRampToValueAtTime(k === kind ? BED_GAIN : 0, now + 1.8)
    }
  }

  /** Day/night filter modulation — a minor secondary texture cue. The real time-of-day signal is
   * the scheduled feature sounds in scheduleFeatureSounds(), not this. */
  tick(): void {
    if (!this.ctx || !this.activeKind) return
    const bed = this.beds[this.activeKind]
    const solar = this.hooks?.getActiveSolar()
    if (bed && solar) {
      const dark = Math.max(0, Math.min(1, -solar.elevation / 14))
      const target = bed.baseOutFreq * (0.7 + 0.3 * (1 - dark))
      bed.outFilter.frequency.setTargetAtTime(target, this.ctx.currentTime, 2)
    }
  }

  private playConfirmBlip(): void {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    env.gain.value = 0
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, t)
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.2)
    env.gain.linearRampToValueAtTime(0.09, t + 0.03)
    env.gain.linearRampToValueAtTime(0, t + 0.22)
    osc.connect(env)
    env.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.3)
  }

  // ---- Shared synthesis helpers ---------------------------------------------------------------

  /** A single tone with a pitch ramp and a short attack/decay envelope — the basis for bird,
   * owl, frog and chime hits. */
  private playTone(opts: {
    type: OscillatorType
    freqFrom: number
    freqTo?: number
    rampTime?: number
    attack: number
    peak: number
    decay: number
    delay?: number
  }): void {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx
    const t = ctx.currentTime + (opts.delay ?? 0)
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    env.gain.value = 0
    osc.type = opts.type
    osc.frequency.setValueAtTime(opts.freqFrom, t)
    if (opts.freqTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(opts.freqTo, t + (opts.rampTime ?? opts.attack + opts.decay))
    }
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(opts.peak, t + opts.attack)
    env.gain.linearRampToValueAtTime(0, t + opts.attack + opts.decay)
    osc.connect(env)
    env.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + opts.attack + opts.decay + 0.05)
  }

  /** A burst of filtered noise with a swelling envelope — the basis for waves, wind, traffic and
   * thunder. A fresh BufferSource each call (cheap) rather than reusing one long-lived node. */
  private playNoiseBurst(opts: {
    filterType: BiquadFilterType
    freqFrom: number
    freqTo?: number
    rampTime?: number
    q?: number
    attack: number
    peak: number
    decay: number
    delay?: number
  }): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return
    const ctx = this.ctx
    const t = ctx.currentTime + (opts.delay ?? 0)
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = opts.filterType
    filter.frequency.setValueAtTime(opts.freqFrom, t)
    if (opts.freqTo !== undefined) {
      filter.frequency.linearRampToValueAtTime(opts.freqTo, t + (opts.rampTime ?? opts.attack + opts.decay))
    }
    if (opts.q) filter.Q.value = opts.q

    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(opts.peak, t + opts.attack)
    env.gain.linearRampToValueAtTime(0, t + opts.attack + opts.decay)

    src.connect(filter)
    filter.connect(env)
    env.connect(this.masterGain)
    src.start(t)
    src.stop(t + opts.attack + opts.decay + 0.05)
  }

  // ---- The time-of-day signal: recognizable, scene-appropriate sound events ------------------

  private playSound(type: SoundType): void {
    switch (type) {
      case 'birdChorus': {
        const count = 3 + Math.floor(Math.random() * 3)
        for (let i = 0; i < count; i++) this.playBird(Math.random() * 0.3)
        break
      }
      case 'birdSingle':
        this.playBird(0)
        break
      case 'owl':
        this.playTone({ type: 'sine', freqFrom: 380, freqTo: 280, attack: 0.08, peak: 0.08, decay: 0.5 })
        this.playTone({ type: 'sine', freqFrom: 360, freqTo: 260, attack: 0.08, peak: 0.07, decay: 0.5, delay: 0.75 })
        break
      case 'cricket': {
        const count = 3 + Math.floor(Math.random() * 4)
        for (let i = 0; i < count; i++) {
          this.playTone({
            type: 'square',
            freqFrom: 4100 + Math.random() * 400,
            attack: 0.008,
            peak: 0.022,
            decay: 0.05,
            delay: i * (0.1 + Math.random() * 0.05),
          })
        }
        break
      }
      case 'seagull':
        this.playTone({ type: 'sine', freqFrom: 1250, freqTo: 1750, rampTime: 0.22, attack: 0.05, peak: 0.055, decay: 0.3 })
        this.playTone({
          type: 'sine',
          freqFrom: 1700,
          freqTo: 1300,
          rampTime: 0.2,
          attack: 0.02,
          peak: 0.045,
          decay: 0.25,
          delay: 0.26,
        })
        break
      case 'waveCrash':
        this.playNoiseBurst({ filterType: 'bandpass', freqFrom: 500, freqTo: 900, rampTime: 0.6, q: 0.6, attack: 0.15, peak: 0.16, decay: 1.1 })
        break
      case 'trafficSwell':
        this.playNoiseBurst({
          filterType: 'bandpass',
          freqFrom: 280,
          freqTo: 850,
          rampTime: 0.9,
          q: 0.8,
          attack: 0.5,
          peak: 0.1,
          decay: 1.0,
        })
        break
      case 'windGust':
        this.playNoiseBurst({ filterType: 'lowpass', freqFrom: 300, freqTo: 550, rampTime: 1.5, attack: 1.0, peak: 0.1, decay: 2.2 })
        break
      case 'frog': {
        const count = 2 + Math.floor(Math.random() * 2)
        for (let i = 0; i < count; i++) {
          this.playTone({ type: 'triangle', freqFrom: 220, attack: 0.01, peak: 0.05, decay: 0.08, delay: i * 0.14 })
        }
        break
      }
      case 'thunder':
        this.playNoiseBurst({ filterType: 'lowpass', freqFrom: 140, attack: 0.3, peak: 0.14, decay: 2.3 })
        break
      case 'chime': {
        const freq = [784, 880, 988, 1175][Math.floor(Math.random() * 4)]
        this.playTone({ type: 'sine', freqFrom: freq, attack: 0.01, peak: 0.05, decay: 1.4 })
        this.playTone({ type: 'sine', freqFrom: freq * 2.01, attack: 0.01, peak: 0.015, decay: 0.8 })
        break
      }
      case 'shimmer':
        this.playNoiseBurst({ filterType: 'highpass', freqFrom: 1800, attack: 0.5, peak: 0.035, decay: 1.6 })
        break
    }
  }

  private playBird(delay: number): void {
    this.playTone({
      type: 'sine',
      freqFrom: 1800 + Math.random() * 800,
      freqTo: 1200,
      rampTime: 0.12,
      attack: 0.02,
      peak: 0.05,
      decay: 0.16,
      delay,
    })
  }

  private scheduleFeatureSounds(): void {
    const tick = () => {
      let nextDelay = 4000
      if (this.ctx && this.masterGain && this.masterGain.gain.value > 0.01 && this.activeKind) {
        const solar = this.hooks?.getActiveSolar()
        if (solar) {
          const band = bandFor(solar.elevation, solar.hourAngle)
          const spec = SOUND_SCHEDULE[this.activeKind][band]
          this.playSound(spec.primary)
          if (spec.secondary && Math.random() < (spec.secondaryChance ?? 0)) this.playSound(spec.secondary)
          const [min, max] = spec.intervalMs
          nextDelay = min + Math.random() * (max - min)
        }
      }
      this.featureTimer = setTimeout(tick, nextDelay)
    }
    this.featureTimer = setTimeout(tick, 2000)
  }

  /** Test/debug only: taps the master output into a caller-provided AnalyserNode. */
  debugTap(analyser: AnalyserNode): void {
    this.masterGain?.connect(analyser)
  }

  dispose(): void {
    if (this.featureTimer) clearTimeout(this.featureTimer)
    this.featureTimer = null
    void this.ctx?.close()
    this.ctx = null
  }
}

export const ambientAudioEngine = new AmbientAudioEngine()

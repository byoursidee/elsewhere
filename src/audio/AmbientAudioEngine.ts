import { SCENE_KINDS, type SceneKind } from '../domain/scenes'

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
 * Rebalanced from the first pass: every kind now has real energy in ~400Hz-3kHz, not just
 * sub-300Hz rumble, which is what made it "technically playing but perceptually silent" on
 * small speakers. The low-frequency character (rumble/swell/wind bed) is kept via the input
 * filter; the output filter adds a mid-band layer that actually reads on tiny speakers.
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
  private beds: Partial<Record<SceneKind, Bed>> = {}
  private blipTimer: ReturnType<typeof setTimeout> | null = null
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

    this.scheduleBlips()
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
      bed.gain.gain.linearRampToValueAtTime(k === kind ? 0.6 : 0, now + 1.8)
    }
  }

  /** Day/night filter modulation — called on the same slow (~15s) cadence as solar recompute. */
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

  private playBlip(type: 'bird' | 'cricket'): void {
    if (!this.ctx || !this.masterGain) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    env.gain.value = 0
    osc.connect(env)
    env.connect(this.masterGain)
    if (type === 'bird') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1800 + Math.random() * 800, t)
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.12)
      env.gain.linearRampToValueAtTime(0.05, t + 0.02)
      env.gain.linearRampToValueAtTime(0, t + 0.18)
    } else {
      osc.type = 'square'
      osc.frequency.setValueAtTime(4200 + Math.random() * 300, t)
      env.gain.linearRampToValueAtTime(0.025, t + 0.01)
      env.gain.linearRampToValueAtTime(0, t + 0.07)
    }
    osc.start(t)
    osc.stop(t + 0.3)
  }

  private scheduleBlips(): void {
    const tick = () => {
      if (this.ctx && this.masterGain && this.masterGain.gain.value > 0.01 && this.activeKind) {
        const solar = this.hooks?.getActiveSolar()
        if (solar) {
          const dawnBirds =
            solar.elevation > -4 &&
            solar.elevation < 10 &&
            solar.hourAngle < 0 &&
            (['forest', 'mountain', 'lake'] as SceneKind[]).includes(this.activeKind)
          const nightCrickets =
            solar.elevation < 0 && (['forest', 'lake'] as SceneKind[]).includes(this.activeKind)
          if (dawnBirds) this.playBlip('bird')
          else if (nightCrickets) this.playBlip('cricket')
        }
      }
      this.blipTimer = setTimeout(tick, 4000 + Math.random() * 5000)
    }
    this.blipTimer = setTimeout(tick, 4000)
  }

  /** Test/debug only: taps the master output into a caller-provided AnalyserNode. */
  debugTap(analyser: AnalyserNode): void {
    this.masterGain?.connect(analyser)
  }

  dispose(): void {
    if (this.blipTimer) clearTimeout(this.blipTimer)
    this.blipTimer = null
    void this.ctx?.close()
    this.ctx = null
  }
}

export const ambientAudioEngine = new AmbientAudioEngine()

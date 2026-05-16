interface ActiveNode {
  mainNode: AudioScheduledSourceNode
  gainNode: GainNode
  cleanupFns: Array<() => void>
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private activeNodes = new Map<string, ActiveNode>()

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.85
      this.masterGain.connect(this.ctx.destination)
    }
    return this.ctx
  }

  private makeNoise(ctx: AudioContext, type: 'white' | 'pink' | 'brown', seconds = 5): AudioBuffer {
    const n = ctx.sampleRate * seconds
    const buf = ctx.createBuffer(2, n, ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      if (type === 'white') {
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
      } else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
        for (let i = 0; i < n; i++) {
          const w = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + w * 0.0555179
          b1 = 0.99332 * b1 + w * 0.0750759
          b2 = 0.96900 * b2 + w * 0.1538520
          b3 = 0.86650 * b3 + w * 0.3104856
          b4 = 0.55000 * b4 + w * 0.5329522
          b5 = -0.7616 * b5 - w * 0.0168980
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
          b6 = w * 0.115926
        }
      } else {
        let last = 0
        for (let i = 0; i < n; i++) {
          const w = Math.random() * 2 - 1
          d[i] = (last + 0.02 * w) / 1.02
          last = d[i]
          d[i] *= 3.5
        }
      }
    }
    return buf
  }

  private noiseSource(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
    const src = ctx.createBufferSource()
    src.buffer = this.makeNoise(ctx, type)
    src.loop = true
    return src
  }

  private makeLfo(
    ctx: AudioContext,
    freq: number,
    type: OscillatorType = 'sine',
  ): [OscillatorNode, () => void] {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    osc.start()
    return [
      osc,
      () => {
        try { osc.stop() } catch { /* already stopped */ }
        try { osc.disconnect() } catch { /* already disconnected */ }
      },
    ]
  }

  async play(soundId: string, volume: number): Promise<void> {
    if (this.activeNodes.has(soundId)) {
      this.setVolume(soundId, volume)
      return
    }

    const ctx = this.getCtx()
    if (ctx.state === 'suspended') await ctx.resume()

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.9)
    gainNode.connect(this.masterGain!)

    const cleanupFns: Array<() => void> = []
    let mainNode: AudioScheduledSourceNode

    switch (soundId) {
      case 'white-noise': {
        const src = this.noiseSource(ctx, 'white')
        src.connect(gainNode)
        src.start()
        mainNode = src
        break
      }

      case 'brown-noise': {
        const src = this.noiseSource(ctx, 'brown')
        const lpf = ctx.createBiquadFilter()
        lpf.type = 'lowpass'
        lpf.frequency.value = 350
        src.connect(lpf)
        lpf.connect(gainNode)
        src.start()
        mainNode = src
        break
      }

      case 'rain': {
        const src = this.noiseSource(ctx, 'pink')
        const hpf = ctx.createBiquadFilter()
        hpf.type = 'highpass'
        hpf.frequency.value = 500
        const bpf = ctx.createBiquadFilter()
        bpf.type = 'bandpass'
        bpf.frequency.value = 3000
        bpf.Q.value = 0.3
        src.connect(hpf)
        hpf.connect(bpf)
        bpf.connect(gainNode)
        src.start()
        mainNode = src
        break
      }

      case 'ocean': {
        const src = this.noiseSource(ctx, 'brown')
        const lpf = ctx.createBiquadFilter()
        lpf.type = 'lowpass'
        lpf.frequency.value = 550
        const [lfoOsc, lfoClean] = this.makeLfo(ctx, 0.12)
        const lfoG = ctx.createGain()
        lfoG.gain.value = 0.38
        lfoOsc.connect(lfoG)
        lfoG.connect(gainNode.gain)
        src.connect(lpf)
        lpf.connect(gainNode)
        src.start()
        cleanupFns.push(lfoClean)
        mainNode = src
        break
      }

      case 'forest': {
        const src = this.noiseSource(ctx, 'pink')
        const lpf = ctx.createBiquadFilter()
        lpf.type = 'lowpass'
        lpf.frequency.value = 2200
        const [lfoOsc, lfoClean] = this.makeLfo(ctx, 0.05)
        const lfoG = ctx.createGain()
        lfoG.gain.value = 0.18
        lfoOsc.connect(lfoG)
        lfoG.connect(gainNode.gain)
        src.connect(lpf)
        lpf.connect(gainNode)
        src.start()
        cleanupFns.push(lfoClean)
        mainNode = src
        break
      }

      case 'wind': {
        const src = this.noiseSource(ctx, 'white')
        const bpf = ctx.createBiquadFilter()
        bpf.type = 'bandpass'
        bpf.frequency.value = 800
        bpf.Q.value = 1.5
        const [freqLfo, freqClean] = this.makeLfo(ctx, 0.07)
        const freqG = ctx.createGain()
        freqG.gain.value = 420
        freqLfo.connect(freqG)
        freqG.connect(bpf.frequency)
        const [volLfo, volClean] = this.makeLfo(ctx, 0.14)
        const volG = ctx.createGain()
        volG.gain.value = 0.28
        volLfo.connect(volG)
        volG.connect(gainNode.gain)
        src.connect(bpf)
        bpf.connect(gainNode)
        src.start()
        cleanupFns.push(freqClean, volClean)
        mainNode = src
        break
      }

      case 'fire': {
        const src = this.noiseSource(ctx, 'pink')
        const hpf = ctx.createBiquadFilter()
        hpf.type = 'highpass'
        hpf.frequency.value = 700
        const lpf = ctx.createBiquadFilter()
        lpf.type = 'lowpass'
        lpf.frequency.value = 4500
        const [lfoOsc, lfoClean] = this.makeLfo(ctx, 7, 'sawtooth')
        const lfoG = ctx.createGain()
        lfoG.gain.value = 0.18
        lfoOsc.connect(lfoG)
        lfoG.connect(gainNode.gain)
        src.connect(hpf)
        hpf.connect(lpf)
        lpf.connect(gainNode)
        src.start()
        cleanupFns.push(lfoClean)
        mainNode = src
        break
      }

      case 'thunder': {
        const src = this.noiseSource(ctx, 'brown')
        const lpf = ctx.createBiquadFilter()
        lpf.type = 'lowpass'
        lpf.frequency.value = 160
        const [lfoOsc, lfoClean] = this.makeLfo(ctx, 0.03)
        const lfoG = ctx.createGain()
        lfoG.gain.value = 0.5
        lfoOsc.connect(lfoG)
        lfoG.connect(gainNode.gain)
        src.connect(lpf)
        lpf.connect(gainNode)
        src.start()
        cleanupFns.push(lfoClean)
        mainNode = src
        break
      }

      case 'night': {
        const src = this.noiseSource(ctx, 'white')
        const bpf = ctx.createBiquadFilter()
        bpf.type = 'bandpass'
        bpf.frequency.value = 3800
        bpf.Q.value = 18
        const [lfoOsc, lfoClean] = this.makeLfo(ctx, 20, 'square')
        const lfoG = ctx.createGain()
        lfoG.gain.value = 0.65
        lfoOsc.connect(lfoG)
        lfoG.connect(gainNode.gain)
        src.connect(bpf)
        bpf.connect(gainNode)
        src.start()
        cleanupFns.push(lfoClean)
        mainNode = src
        break
      }

      case 'binaural-focus': {
        // ~10 Hz alpha beat: 200 Hz left, 210 Hz right
        const leftOsc = ctx.createOscillator()
        leftOsc.type = 'sine'
        leftOsc.frequency.value = 200
        const rightOsc = ctx.createOscillator()
        rightOsc.type = 'sine'
        rightOsc.frequency.value = 210
        const leftPan = ctx.createStereoPanner()
        leftPan.pan.value = -1
        const rightPan = ctx.createStereoPanner()
        rightPan.pan.value = 1
        leftOsc.connect(leftPan)
        leftPan.connect(gainNode)
        rightOsc.connect(rightPan)
        rightPan.connect(gainNode)
        leftOsc.start()
        rightOsc.start()
        cleanupFns.push(() => {
          try { rightOsc.stop() } catch { /* already stopped */ }
          try { rightOsc.disconnect() } catch { /* already disconnected */ }
        })
        mainNode = leftOsc
        break
      }

      case 'binaural-relax': {
        // ~6 Hz theta beat: 174 Hz left, 180 Hz right
        const leftOsc = ctx.createOscillator()
        leftOsc.type = 'sine'
        leftOsc.frequency.value = 174
        const rightOsc = ctx.createOscillator()
        rightOsc.type = 'sine'
        rightOsc.frequency.value = 180
        const leftPan = ctx.createStereoPanner()
        leftPan.pan.value = -1
        const rightPan = ctx.createStereoPanner()
        rightPan.pan.value = 1
        leftOsc.connect(leftPan)
        leftPan.connect(gainNode)
        rightOsc.connect(rightPan)
        rightPan.connect(gainNode)
        leftOsc.start()
        rightOsc.start()
        cleanupFns.push(() => {
          try { rightOsc.stop() } catch { /* already stopped */ }
          try { rightOsc.disconnect() } catch { /* already disconnected */ }
        })
        mainNode = leftOsc
        break
      }

      case 'singing-bowl': {
        const freq = 432
        const osc1 = ctx.createOscillator()
        osc1.type = 'sine'
        osc1.frequency.value = freq
        const osc2 = ctx.createOscillator()
        osc2.type = 'sine'
        osc2.frequency.value = freq * 2.756
        const g2 = ctx.createGain()
        g2.gain.value = 0.28
        const osc3 = ctx.createOscillator()
        osc3.type = 'sine'
        osc3.frequency.value = freq * 5.4
        const g3 = ctx.createGain()
        g3.gain.value = 0.08
        const [tremOsc, tremClean] = this.makeLfo(ctx, 0.22)
        const tremG = ctx.createGain()
        tremG.gain.value = 0.14
        tremOsc.connect(tremG)
        tremG.connect(gainNode.gain)
        osc1.connect(gainNode)
        osc2.connect(g2)
        g2.connect(gainNode)
        osc3.connect(g3)
        g3.connect(gainNode)
        osc1.start()
        osc2.start()
        osc3.start()
        cleanupFns.push(
          () => { try { osc2.stop() } catch { /* */ } try { osc2.disconnect() } catch { /* */ } },
          () => { try { osc3.stop() } catch { /* */ } try { osc3.disconnect() } catch { /* */ } },
          tremClean,
        )
        mainNode = osc1
        break
      }

      default:
        gainNode.disconnect()
        return
    }

    this.activeNodes.set(soundId, { mainNode, gainNode, cleanupFns })
  }

  stop(soundId: string): void {
    const node = this.activeNodes.get(soundId)
    if (!node || !this.ctx) return
    this.activeNodes.delete(soundId)
    const { mainNode, gainNode, cleanupFns } = node
    gainNode.gain.setValueAtTime(gainNode.gain.value, this.ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.65)
    setTimeout(() => {
      try { mainNode.stop() } catch { /* */ }
      cleanupFns.forEach(fn => fn())
      try { gainNode.disconnect() } catch { /* */ }
      try { mainNode.disconnect() } catch { /* */ }
    }, 750)
  }

  stopAll(): void {
    for (const id of [...this.activeNodes.keys()]) this.stop(id)
  }

  setVolume(soundId: string, volume: number): void {
    const node = this.activeNodes.get(soundId)
    if (!node || !this.ctx) return
    node.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1)
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGain || !this.ctx) return
    this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1)
  }

  fadeTo(targetVolume: number, duration: number): void {
    if (!this.masterGain || !this.ctx) return
    this.masterGain.gain.linearRampToValueAtTime(
      targetVolume,
      this.ctx.currentTime + duration,
    )
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') await this.ctx.resume()
  }
}

export const audioEngine = new AudioEngine()

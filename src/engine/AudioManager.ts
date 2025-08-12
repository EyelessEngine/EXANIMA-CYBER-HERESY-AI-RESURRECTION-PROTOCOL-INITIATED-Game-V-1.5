export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private currentSources: Map<string, AudioBufferSourceNode> = new Map();
  private masterVolume: number = 0.5;
  private musicGain: GainNode | null = null;
  private sfxVolume: number = 1.0;

  constructor() {
    this.initializeAudio();
    this.createSynthesizedSounds();
    this.createRockGuitarMelody();
    this.createMenuSuspenseMusic();
    // this.createLevel1BackgroundMusic(); // Comentado - solo usar MP3
    this.loadExternalAudio(); // Cargar archivos de audio externos
  }

  private initializeAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private createSynthesizedSounds(): void {
    if (!this.audioContext) return;

    // Create weapon fire sound
    this.createWeaponFireSound();
    
    // Create enemy death sound
    this.createEnemyDeathSound();
    
    // Create ambient cathedral sound
    this.createAmbientSound();
    
    // Create dash sound
    this.createDashSound();
    
    // Create new sounds for expanded levels
    this.createMemoryRecoveredSound();
    this.createCoreDeactivatedSound();
    this.createWallRunSound();
    this.createTimeSlowSound();
    this.createIndustrialMetalAmbient();
    this.createBinaryChantAmbient();
    // Crear disparo realista
    this.createRealGunShotSound();
    // Crear impacto con eco
    this.createLaserImpactEchoSound();
  }

  private createWeaponFireSound(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 10);
      const noise = (Math.random() - 0.5) * 2;
      const tone = Math.sin(2 * Math.PI * 200 * t) * 0.5;
      data[i] = (noise * 0.3 + tone * 0.7) * envelope * 0.3;
    }

    this.sounds.set('weapon_fire', buffer);
  }

  private createEnemyDeathSound(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.7;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Grito de agonía: tono descendente, distorsión, vibrato
      const baseFreq = 520 - t * 320; // baja de 520Hz a 200Hz
      const vibrato = Math.sin(2 * Math.PI * 7 * t) * 0.18;
      let wave = Math.sin(2 * Math.PI * (baseFreq + vibrato * 40) * t);
      // Distorsión fuerte
      wave = Math.tanh(wave * 3.5);
      // Ruido de fondo para aspereza
      const noise = (Math.random() - 0.5) * 0.18 * (1 - t);
      // Envolvente: ataque rápido, release lento
      const env = t < 0.08 ? t / 0.08 : 1 - (t - 0.08) / 0.62;
      data[i] = (wave * 0.7 + noise) * Math.max(0, env) * 0.7;
    }

    this.sounds.set('enemy_death', buffer);
  }

  private createAmbientSound(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 4.0;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        const drone = Math.sin(2 * Math.PI * 60 * t) * 0.1;
        const whisper = (Math.random() - 0.5) * 0.05 * Math.sin(2 * Math.PI * 0.5 * t);
        const glitch = Math.random() < 0.001 ? (Math.random() - 0.5) * 0.2 : 0;
        
        data[i] = drone + whisper + glitch;
      }
    }

    this.sounds.set('cathedral_ambience', buffer);
  }

  private createDashSound(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 15);
      const sweep = Math.sin(2 * Math.PI * (400 + 200 * t) * t);
      data[i] = sweep * envelope * 0.3;
    }

    this.sounds.set('dash', buffer);
  }

  private createMemoryRecoveredSound(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 5);
      const harmonics = Math.sin(2 * Math.PI * 440 * t) + 
                       Math.sin(2 * Math.PI * 880 * t) * 0.5 +
                       Math.sin(2 * Math.PI * 1320 * t) * 0.25;
      data[i] = harmonics * envelope * 0.2;
    }

    this.sounds.set('memory_recovered', buffer);
  }

  private createCoreDeactivatedSound(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.0;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      const powerDown = Math.sin(2 * Math.PI * (200 - 150 * t) * t);
      const digital = (Math.random() - 0.5) * 0.1 * envelope;
      data[i] = (powerDown + digital) * envelope * 0.3;
    }

    this.sounds.set('core_deactivated', buffer);
  }

  private createWallRunSound(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = 1 - t / duration;
      const scrape = (Math.random() - 0.5) * 2 * envelope;
      const metallic = Math.sin(2 * Math.PI * 150 * t) * 0.3;
      data[i] = (scrape * 0.7 + metallic * 0.3) * envelope * 0.25;
    }

    this.sounds.set('wall_run_start', buffer);
    this.sounds.set('wall_jump', buffer);
  }

  private createTimeSlowSound(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3);
      const timeWarp = Math.sin(2 * Math.PI * (100 + 300 * Math.exp(-t * 5)) * t);
      const digital = Math.sin(2 * Math.PI * 1000 * t) * 0.2 * envelope;
      data[i] = (timeWarp + digital) * envelope * 0.3;
    }

    this.sounds.set('time_slow_activated', buffer);
  }

  private createIndustrialMetalAmbient(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 6.0;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        const metalDrone = Math.sin(2 * Math.PI * 40 * t) * 0.15;
        const machinery = (Math.random() - 0.5) * 0.08 * Math.sin(2 * Math.PI * 2 * t);
        const distantExplosion = Math.random() < 0.0005 ? (Math.random() - 0.5) * 0.3 : 0;
        const neonBuzz = Math.sin(2 * Math.PI * 120 * t) * 0.05 * (Math.random() > 0.7 ? 1 : 0);
        
        data[i] = metalDrone + machinery + distantExplosion + neonBuzz;
      }
    }

    this.sounds.set('industrial_metal', buffer);
  }

  private createBinaryChantAmbient(): void {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 5.0;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        const digitalChoir = Math.sin(2 * Math.PI * 220 * t) * 0.1 * Math.sin(2 * Math.PI * 0.3 * t);
        const binaryPulse = Math.sin(2 * Math.PI * 4 * t) > 0 ? 0.05 : 0;
        const serverHum = Math.sin(2 * Math.PI * 50 * t) * 0.08;
        const dataStream = (Math.random() - 0.5) * 0.03 * (Math.sin(2 * Math.PI * 10 * t) > 0 ? 1 : 0);
        
        data[i] = digitalChoir + binaryPulse + serverHum + dataStream;
      }
    }

    this.sounds.set('binary_chants', buffer);
  }

  private createRockGuitarMelody(): void {
    if (!this.audioContext) return;
    // DOOM Main Theme - Motivo principal y segunda sección, simplificado
    // Alterna bajo y melodía, nunca suenan juntos
    const melody1 = [329.63, 329.63, 329.63, 261.63, 329.63, 392.00, 196.00, 261.63, 329.63, 392.00, 196.00];
    const bass1 = [82.41, 82.41, 82.41, 82.41, 98.00, 98.00, 98.00, 98.00];
    const melody2 = [329.63, 349.23, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66,
                     329.63, 349.23, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66];
    const bass2 = [98.00, 98.00, 98.00, 98.00, 87.31, 87.31, 87.31, 87.31];
    const melodyDur1 = 0.13;
    const bassDur1 = 0.22;
    const melodyDur2 = 0.09;
    const bassDur2 = 0.18;
    // Alternar bajo y melodía (no juntos)
    const sequence = [];
    for (let i = 0; i < 8; i++) {
      sequence.push({f: bass1[i], d: bassDur1, type: 'bass'});
      if (i < melody1.length) {
        sequence.push({f: melody1[i], d: melodyDur1, type: 'lead'});
      }
    }
    for (let i = 0; i < 8; i++) {
      sequence.push({f: bass2[i], d: bassDur2, type: 'bass'});
      if (i * 2 < melody2.length) {
        sequence.push({f: melody2[i * 2], d: melodyDur2, type: 'lead'});
        sequence.push({f: melody2[i * 2 + 1], d: melodyDur2, type: 'lead'});
      }
    }
    // Repetición para bucle
    for (let i = 0; i < 2; i++) {
      sequence.push(...sequence);
    }
    const sampleRate = this.audioContext.sampleRate;
    const duration = sequence.reduce((acc, n) => acc + n.d, 0) + 0.5;
    const buffer = this.audioContext.createBuffer(1, Math.ceil(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    let t = 0;
    for (const note of sequence) {
      const start = Math.floor(t * sampleRate);
      const end = Math.floor((t + note.d) * sampleRate);
      for (let i = start; i < end; i++) {
        const rel = (i - start) / (end - start);
        let sample = 0;
        if (note.type === 'lead') {
          // Guitarra eléctrica distorsionada con leve vibrato
          sample = Math.asin(Math.sin(2 * Math.PI * note.f * rel + Math.sin(rel * 8) * 0.1)) * 1.3;
          sample += 0.3 * Math.sin(2 * Math.PI * note.f * 2 * rel);
          let env = 1.0;
          if (rel < 0.08) env = rel / 0.08;
          if (rel > 0.85) env *= 1 - (rel - 0.85) / 0.15;
          sample = Math.tanh(sample * 3.5) * env * 0.28;
        } else {
          // Bajo con ataque suave
          let env = rel < 0.12 ? rel / 0.12 : 1.0;
          sample = Math.sin(2 * Math.PI * note.f * rel) * 0.32 * env;
        }
        // Delay/eco simple para profundidad
        let delayed = 0;
        if (i - Math.floor(sampleRate * 0.18) >= 0) {
          delayed = data[i - Math.floor(sampleRate * 0.18)] * 0.35;
        }
        data[i] = sample + delayed;
      }
      t += note.d;
    }
    this.sounds.set('rock_guitar_melody', buffer);
  }

  public playSound(soundName: string, volume: number = 1.0): void {
    if (!this.audioContext) return;
    const buffer = this.sounds.get(soundName);
    if (!buffer) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    const gain = this.audioContext.createGain();
    gain.gain.value = (volume ?? 1.0) * this.sfxVolume * this.masterVolume;
    source.connect(gain).connect(this.audioContext.destination);
    source.start(0);
    this.currentSources.set(soundName, source);
    source.onended = () => {
      this.currentSources.delete(soundName);
    };
  }

  public playAmbientSound(soundName: string, volume: number = 0.3): void {
    if (!this.audioContext || !this.sounds.has(soundName)) return;

    if (this.currentSources.has(soundName)) {
      this.currentSources.get(soundName)!.stop();
    }

    const buffer = this.sounds.get(soundName)!;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    // --- Usar musicGain para la música de fondo ---
    if (!this.musicGain) {
      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = 1;
      this.musicGain.connect(this.audioContext.destination);
    }
    source.connect(this.musicGain);
    this.musicGain.gain.value = volume;
    source.start();
    this.currentSources.set(soundName, source);
  }

  public stopSound(soundName: string): void {
    if (this.currentSources.has(soundName)) {
      this.currentSources.get(soundName)!.stop();
      this.currentSources.delete(soundName);
    }
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  public setMusicVolume(volume: number): void {
    if (this.musicGain) {
      this.musicGain.gain.value = volume;
    }
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  public resumeAudioContext(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Disparo realista de pistola
  private createRealGunShotSound(): void {
    if (!this.audioContext) return;
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.0; // Cambiado a 1 segundo
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Envolvente rápida
      const env = Math.exp(-t * 18);
      // Ruido para el "crack"
      const noise = (Math.random() - 0.5) * 2 * env * 0.7;
      // "Pop" inicial
      const pop = Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t * 40) * 0.5;
      // Resonancia metálica
      const metal = Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 25) * 0.2;
      data[i] = (noise + pop + metal) * 0.7;
    }
    this.sounds.set('real_gun_shot', buffer);
  }

  // Impacto con eco digital
  private createLaserImpactEchoSound(): void {
    if (!this.audioContext) return;
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.0; // Cambiado a 1 segundo
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Golpe inicial
      const hit = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 18);
      // Eco digital (repeticiones atenuadas)
      let echo = 0;
      if (i > sampleRate * 0.08) echo += data[i - Math.floor(sampleRate * 0.08)] * 0.5;
      if (i > sampleRate * 0.16) echo += data[i - Math.floor(sampleRate * 0.16)] * 0.3;
      if (i > sampleRate * 0.24) echo += data[i - Math.floor(sampleRate * 0.24)] * 0.18;
      data[i] = (hit + echo) * 0.7;
    }
    this.sounds.set('laser_impact_echo', buffer);
  }

  // Música del menú basada en la partitura 'Suspense'
  private createMenuSuspenseMusic(): void {
    if (!this.audioContext) return;
    const sampleRate = this.audioContext.sampleRate;
    const tempo = 60; // Adagio
    const quarter = 60 / tempo; // duración de negra
    // Notas principales (simplificadas): C, Eb, F, G, Bb
    const notes = [
      { f: 261.63, d: quarter }, // C4
      { f: 311.13, d: quarter }, // Eb4
      { f: 349.23, d: quarter }, // F4
      { f: 392.00, d: quarter }, // G4
      { f: 466.16, d: quarter }, // Bb4
      { f: 392.00, d: quarter }, // G4
      { f: 349.23, d: quarter }, // F4
      { f: 311.13, d: quarter }, // Eb4
    ];
    // Repetir la secuencia para 4 compases
    let sequence = [];
    for (let i = 0; i < 4; i++) sequence.push(...notes);
    const duration = sequence.reduce((acc, n) => acc + n.d, 0) + 0.5;
    const buffer = this.audioContext.createBuffer(1, Math.ceil(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    let t = 0;
    for (const note of sequence) {
      const start = Math.floor(t * sampleRate);
      const end = Math.floor((t + note.d) * sampleRate);
      for (let i = start; i < end; i++) {
        const rel = (i - start) / (end - start);
        // Piano: envolvente rápida, tono puro
        let sample = Math.sin(2 * Math.PI * note.f * rel) * Math.exp(-rel * 4);
        // Cuerdas: tono más suave y sostenido
        sample += Math.sin(2 * Math.PI * (note.f / 2) * rel) * 0.3 * Math.exp(-rel * 1.5);
        // Contrabajo: una octava abajo, muy suave
        sample += Math.sin(2 * Math.PI * (note.f / 4) * rel) * 0.12 * Math.exp(-rel * 1.2);
        data[i] += sample * 0.5;
      }
      t += note.d;
    }
    this.sounds.set('menu_suspense', buffer);
  }

  // Música cyberpunk para el primer nivel - Silicon Cathedral (DESHABILITADA)
  // Ahora solo se usa la canción MP3 externa
  /*
  private createLevel1BackgroundMusic(): void {
    if (!this.audioContext) return;
    
    const sampleRate = this.audioContext.sampleRate;
    const tempo = 140; // BPM más rápido para acción
    const beat = 60 / tempo;
    
    // Melodía principal cyberpunk
    const melody = [
      { f: 220, d: beat * 2 }, // A3 - nota base
      { f: 277.18, d: beat }, // C#4
      { f: 329.63, d: beat }, // E4
      { f: 277.18, d: beat }, // C#4
      { f: 220, d: beat * 2 }, // A3
      { f: 196, d: beat }, // G3
      { f: 220, d: beat }, // A3
      { f: 246.94, d: beat }, // B3
    ];
    
    // Bajo sintético
    const bass = [
      { f: 55, d: beat * 2 }, // A1
      { f: 55, d: beat * 2 }, // A1
      { f: 49, d: beat * 2 }, // G1
      { f: 55, d: beat * 2 }, // A1
    ];
    
    // Secuencia completa (4 compases)
    const sequence = [];
    for (let i = 0; i < 4; i++) {
      sequence.push(...melody);
      sequence.push(...bass);
    }
    
    const duration = sequence.reduce((acc, n) => acc + n.d, 0) + 0.5;
    const buffer = this.audioContext.createBuffer(2, Math.ceil(sampleRate * duration), sampleRate);
    
    // Canal izquierdo - Melodía
    const leftData = buffer.getChannelData(0);
    // Canal derecho - Bajo y efectos
    const rightData = buffer.getChannelData(1);
    
    let t = 0;
    let melodyIndex = 0;
    let bassIndex = 0;
    
    for (let measure = 0; measure < 4; measure++) {
      // Melodía en canal izquierdo
      for (let i = 0; i < melody.length; i++) {
        const note = melody[i];
        const start = Math.floor(t * sampleRate);
        const end = Math.floor((t + note.d) * sampleRate);
        
        for (let j = start; j < end; j++) {
          const rel = (j - start) / (end - start);
          
          // Sintetizador principal con distorsión
          let sample = Math.sin(2 * Math.PI * note.f * rel);
          sample += 0.3 * Math.sin(2 * Math.PI * note.f * 2 * rel); // Armónicos
          sample += 0.1 * Math.sin(2 * Math.PI * note.f * 3 * rel); // Más armónicos
          
          // Envolvente ADSR
          let env = 1.0;
          if (rel < 0.1) env = rel / 0.1; // Attack
          else if (rel > 0.8) env = (1 - rel) / 0.2; // Release
          
          // Distorsión cyberpunk
          sample = Math.tanh(sample * 2.5) * env * 0.4;
          
          leftData[j] += sample;
        }
        t += note.d;
      }
      
      // Bajo en canal derecho
      for (let i = 0; i < bass.length; i++) {
        const note = bass[i];
        const start = Math.floor(t * sampleRate);
        const end = Math.floor((t + note.d) * sampleRate);
        
        for (let j = start; j < end; j++) {
          const rel = (j - start) / (end - start);
          
          // Bajo sintético con sub-bass
          let sample = Math.sin(2 * Math.PI * note.f * rel);
          sample += 0.5 * Math.sin(2 * Math.PI * (note.f / 2) * rel); // Sub-bass
          
          // Envolvente más suave para el bajo
          let env = 1.0;
          if (rel < 0.05) env = rel / 0.05;
          else if (rel > 0.9) env = (1 - rel) / 0.1;
          
          sample = sample * env * 0.6;
          
          rightData[j] += sample;
        }
        t += note.d;
      }
    }
    
    // Efectos de ambiente cyberpunk
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      
      // Drone de fondo
      const drone = Math.sin(2 * Math.PI * 60 * t) * 0.05;
      
      // Efectos digitales aleatorios
      const digital = Math.random() < 0.001 ? (Math.random() - 0.5) * 0.1 : 0;
      
      // Reverberación simple
      let reverb = 0;
      if (i > sampleRate * 0.1) reverb += leftData[i - Math.floor(sampleRate * 0.1)] * 0.3;
      if (i > sampleRate * 0.2) reverb += leftData[i - Math.floor(sampleRate * 0.2)] * 0.15;
      
      leftData[i] += drone + digital + reverb * 0.3;
      rightData[i] += drone + digital + reverb * 0.3;
    }
    
    this.sounds.set('level1_background', buffer);
  }
  */

  private loadExternalAudio(): void {
    if (!this.audioContext) return;

    // Cargar la canción MP3 del primer nivel de fondo
    const level1BackgroundPromise = this.loadAudio('/level1_background.mp3');
    level1BackgroundPromise.then(buffer => {
      this.sounds.set('level1_background', buffer);
      console.log('✅ Música del nivel 1 cargada exitosamente');
    }).catch(error => {
      console.warn('⚠️ No se pudo cargar la música MP3 del nivel 1:', error);
      console.log('🔄 Usando música sintetizada como respaldo');
    });
  }

  private loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      return Promise.reject(new Error('AudioContext not initialized'));
    }

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = () => {
        this.audioContext!.decodeAudioData(request.response, (buffer) => {
          if (buffer) {
            resolve(buffer);
          } else {
            reject(new Error(`Failed to decode audio data for ${url}`));
          }
        }, reject);
      };
      request.onerror = () => {
        reject(new Error(`Error loading audio file: ${url}`));
      };
      request.send();
    });
  }
}
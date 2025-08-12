import { Particle, Vector3 } from '../types/game';

export class ParticleSystem {
  public update(particles: Particle[], deltaTime: number): void {
    particles.forEach(particle => {
      // Update position
      particle.pos.x += particle.velocity.x * deltaTime;
      particle.pos.y += particle.velocity.y * deltaTime;
      particle.pos.z += particle.velocity.z * deltaTime;
      
      // Apply gravity to certain particle types
      if (particle.type === 'spark' || particle.type === 'blood') {
        particle.velocity.z -= 0.00001 * deltaTime;
      }
      
      // Apply air resistance
      const resistance = 0.99;
      particle.velocity.x *= resistance;
      particle.velocity.y *= resistance;
      particle.velocity.z *= resistance;
      
      // Update lifetime
      particle.lifetime -= deltaTime;
      
      // Fade out over time
      if (particle.lifetime < particle.maxLifetime * 0.3) {
        const fadeRatio = particle.lifetime / (particle.maxLifetime * 0.3);
        particle.size *= fadeRatio;
      }
    });
  }

  public createDashEffect(pos: Vector3, dir: number, particles: Particle[]): void {
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const spread = Math.PI / 4;
      const angle = dir + Math.PI + (Math.random() - 0.5) * spread;
      const speed = 0.005 + Math.random() * 0.01;
      
      const particle: Particle = {
        id: `dash_${Date.now()}_${i}`,
        pos: { ...pos },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: (Math.random() - 0.5) * 0.003
        },
        color: '#00ffff',
        size: 2 + Math.random() * 3,
        lifetime: 300 + Math.random() * 200,
        maxLifetime: 500,
        type: 'digital_decay'
      };
      
      particles.push(particle);
    }
  }

  public createImpactEffect(pos: Vector3, particles: Particle[]): void {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 0.003 + Math.random() * 0.005;
      
      const particle: Particle = {
        id: `impact_${Date.now()}_${i}`,
        pos: { ...pos },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: Math.random() * 0.005
        },
        color: '#ffaa00',
        size: 1 + Math.random() * 2,
        lifetime: 200 + Math.random() * 100,
        maxLifetime: 300,
        type: 'spark'
      };
      
      particles.push(particle);
    }
  }

  public createDeathEffect(pos: Vector3, particles: Particle[]): void {
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.002 + Math.random() * 0.008;
      
      const colors = ['#ff0000', '#9932cc', '#00ffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle: Particle = {
        id: `death_${Date.now()}_${i}`,
        pos: { ...pos },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: Math.random() * 0.01
        },
        color,
        size: 3 + Math.random() * 4,
        lifetime: 800 + Math.random() * 400,
        maxLifetime: 1200,
        type: 'soul_fragment'
      };
      
      particles.push(particle);
    }
  }

  public createSoulEnergyEffect(pos: Vector3, particles: Particle[]): void {
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.001 + Math.random() * 0.003;
      
      const particle: Particle = {
        id: `soul_${Date.now()}_${i}`,
        pos: {
          x: pos.x + (Math.random() - 0.5) * 2,
          y: pos.y + (Math.random() - 0.5) * 2,
          z: pos.z + Math.random() * 2
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: 0.002
        },
        color: '#9932cc',
        size: 2 + Math.random() * 2,
        lifetime: 2000 + Math.random() * 1000,
        maxLifetime: 3000,
        type: 'soul_fragment'
      };
      
      particles.push(particle);
    }
  }

  public createMemoryFragmentEffect(pos: Vector3, particles: Particle[]): void {
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 0.004 + Math.random() * 0.006;
      
      const particle: Particle = {
        id: `memory_${Date.now()}_${i}`,
        pos: { ...pos },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: 0.008 + Math.random() * 0.005
        },
        color: '#00ff00',
        size: 3 + Math.random() * 3,
        lifetime: 1000 + Math.random() * 500,
        maxLifetime: 1500,
        type: 'memory_fragment'
      };
      
      particles.push(particle);
    }
  }

  public createBinaryChantEffect(pos: Vector3, particles: Particle[]): void {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.001 + Math.random() * 0.002;
      
      const particle: Particle = {
        id: `binary_${Date.now()}_${i}`,
        pos: {
          x: pos.x + (Math.random() - 0.5) * 3,
          y: pos.y + (Math.random() - 0.5) * 3,
          z: pos.z + Math.random() * 1
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: 0.003
        },
        color: '#ffffff',
        size: 1 + Math.random() * 1,
        lifetime: 3000 + Math.random() * 2000,
        maxLifetime: 5000,
        type: 'binary_chant'
      };
      
      particles.push(particle);
    }
  }

  public createNeonGlitchEffect(pos: Vector3, particles: Particle[]): void {
    const particleCount = 6;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.008 + Math.random() * 0.012;
      
      const colors = ['#ff0080', '#00ffff', '#ffff00'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle: Particle = {
        id: `neon_glitch_${Date.now()}_${i}`,
        pos: { ...pos },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: (Math.random() - 0.5) * 0.01
        },
        color,
        size: 2 + Math.random() * 4,
        lifetime: 150 + Math.random() * 100,
        maxLifetime: 250,
        type: 'neon_glitch'
      };
      
      particles.push(particle);
    }
  }
}
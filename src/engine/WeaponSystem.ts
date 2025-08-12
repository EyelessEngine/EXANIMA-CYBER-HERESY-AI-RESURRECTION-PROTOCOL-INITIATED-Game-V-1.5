import { Player, Weapon, Projectile, Particle, Vector3 } from '../types/game';

export class WeaponSystem {
  private weapons: Weapon[] = [
    {
      id: 'biomech_rifle',
      name: 'Biomechanical Rifle',
      type: 'biomech_rifle',
      damage: 25,
      range: 15,
      fireRate: 200,
      soulCost: 0,
      lastFired: 0,
      ammo: -1,
      maxAmmo: -1
    },
    {
      id: 'ionic_redeemer',
      name: 'Redentor Iónico',
      type: 'ionic_redeemer',
      damage: 45,
      range: 8,
      fireRate: 600,
      soulCost: 10,
      lastFired: 0,
      ammo: -1,
      maxAmmo: -1,
      specialEffect: 'data_purification'
    },
    {
      id: 'soul_cannon',
      name: 'Soul Cannon',
      type: 'soul_cannon',
      damage: 50,
      range: 20,
      fireRate: 800,
      soulCost: 20,
      lastFired: 0,
      ammo: -1,
      maxAmmo: -1
    },
    {
      id: 'gravity_hook',
      name: 'Gancho Gravitacional',
      type: 'gravity_hook',
      damage: 15,
      range: 25,
      fireRate: 1000,
      soulCost: 15,
      lastFired: 0,
      ammo: -1,
      maxAmmo: -1,
      specialEffect: 'gravity_pull'
    }
  ];

  public fire(player: Player, projectiles: Projectile[], particles: Particle[]): void {
    const currentTime = Date.now();
    const weapon = this.weapons[player.activeWeapon];
    
    if (!weapon) return;
    
    // Check fire rate
    if (currentTime - weapon.lastFired < weapon.fireRate) return;
    
    // Check soul energy cost
    if (weapon.soulCost > 0 && player.soulEnergy < weapon.soulCost) return;
    
    // Consume soul energy
    if (weapon.soulCost > 0) {
      player.soulEnergy -= weapon.soulCost;
    }
    
    // Create projectile based on weapon type
    if (weapon.type === 'ionic_redeemer') {
      this.fireIonicRedeemer(player, projectiles, particles, weapon);
    } else if (weapon.type === 'gravity_hook') {
      this.fireGravityHook(player, projectiles, particles, weapon);
    } else {
      this.fireStandardProjectile(player, projectiles, particles, weapon);
    }
    
    weapon.lastFired = currentTime;
  }

  private fireStandardProjectile(player: Player, projectiles: Projectile[], particles: Particle[], weapon: Weapon): void {
    const projectile: Projectile = {
      id: `projectile_${Date.now()}_${Math.random()}`,
      pos: { ...player.pos },
      velocity: {
        x: Math.cos(player.dir) * 0.02,
        y: Math.sin(player.dir) * 0.02,
        z: 0
      },
      damage: weapon.damage,
      type: this.getProjectileType(weapon.type),
      lifetime: 3000,
      owner: 'player'
    };
    projectiles.push(projectile);
    this.createMuzzleFlash(player.pos, player.dir, particles, weapon.type);
    // Reproducir sonido de disparo realista
    if (typeof window !== 'undefined' && (window as any).gameEngine && (window as any).gameEngine.audioManager) {
      (window as any).gameEngine.audioManager.playSound('real_gun_shot');
    }
  }

  private fireIonicRedeemer(player: Player, projectiles: Projectile[], particles: Particle[], weapon: Weapon): void {
    // Shotgun-style spread
    const pelletCount = 5;
    const spreadAngle = Math.PI / 8;
    
    for (let i = 0; i < pelletCount; i++) {
      const angle = player.dir + (i - pelletCount / 2) * (spreadAngle / pelletCount);
      
      const projectile: Projectile = {
        id: `ionic_pellet_${Date.now()}_${i}`,
        pos: { ...player.pos },
        velocity: {
          x: Math.cos(angle) * 0.025,
          y: Math.sin(angle) * 0.025,
          z: 0
        },
        damage: weapon.damage / pelletCount,
        type: 'ionic_blast',
        lifetime: 2000,
        owner: 'player',
        specialEffect: 'data_purification'
      };
      
      projectiles.push(projectile);
    }
    
    this.createIonicMuzzleFlash(player.pos, player.dir, particles);
  }

  private fireGravityHook(player: Player, projectiles: Projectile[], particles: Particle[], weapon: Weapon): void {
    const projectile: Projectile = {
      id: `gravity_hook_${Date.now()}`,
      pos: { ...player.pos },
      velocity: {
        x: Math.cos(player.dir) * 0.03,
        y: Math.sin(player.dir) * 0.03,
        z: 0
      },
      damage: weapon.damage,
      type: 'gravity_hook',
      lifetime: 5000,
      owner: 'player',
      specialEffect: 'gravity_pull'
    };
    
    projectiles.push(projectile);
    this.createGravityMuzzleFlash(player.pos, player.dir, particles);
  }

  private getProjectileType(weaponType: string): 'plasma' | 'soul_bolt' | 'neural_spike' | 'ionic_blast' | 'gravity_hook' {
    switch (weaponType) {
      case 'biomech_rifle':
        return 'plasma';
      case 'ionic_redeemer':
        return 'ionic_blast';
      case 'soul_cannon':
        return 'soul_bolt';
      case 'gravity_hook':
        return 'gravity_hook';
      default:
        return 'neural_spike';
    }
  }

  private createMuzzleFlash(pos: Vector3, dir: number, particles: Particle[], weaponType: string): void {
    const flashCount = 8;
    let flashColor = '#ffff00';
    
    switch (weaponType) {
      case 'soul_cannon':
        flashColor = '#9932cc';
        break;
      case 'ionic_redeemer':
        flashColor = '#00ffff';
        break;
      case 'gravity_hook':
        flashColor = '#ff6b35';
        break;
    }
    
    for (let i = 0; i < flashCount; i++) {
      const spread = 0.3;
      const angle = dir + (Math.random() - 0.5) * spread;
      const speed = 0.01 + Math.random() * 0.005;
      
      const particle: Particle = {
        id: `muzzle_${Date.now()}_${i}`,
        pos: {
          x: pos.x + Math.cos(dir) * 0.5,
          y: pos.y + Math.sin(dir) * 0.5,
          z: pos.z
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: (Math.random() - 0.5) * 0.005
        },
        color: flashColor,
        size: 3 + Math.random() * 2,
        lifetime: 150 + Math.random() * 100,
        maxLifetime: 250,
        type: 'spark'
      };
      
      particles.push(particle);
    }
  }

  private createIonicMuzzleFlash(pos: Vector3, dir: number, particles: Particle[]): void {
    const flashCount = 12;
    
    for (let i = 0; i < flashCount; i++) {
      const spread = 0.5;
      const angle = dir + (Math.random() - 0.5) * spread;
      const speed = 0.015 + Math.random() * 0.01;
      
      const particle: Particle = {
        id: `ionic_flash_${Date.now()}_${i}`,
        pos: {
          x: pos.x + Math.cos(dir) * 0.7,
          y: pos.y + Math.sin(dir) * 0.7,
          z: pos.z
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: (Math.random() - 0.5) * 0.008
        },
        color: '#00ffff',
        size: 4 + Math.random() * 3,
        lifetime: 200 + Math.random() * 150,
        maxLifetime: 350,
        type: 'digital_decay'
      };
      
      particles.push(particle);
    }
  }

  private createGravityMuzzleFlash(pos: Vector3, dir: number, particles: Particle[]): void {
    const flashCount = 10;
    
    for (let i = 0; i < flashCount; i++) {
      const angle = (i / flashCount) * Math.PI * 2;
      const speed = 0.008 + Math.random() * 0.006;
      
      const particle: Particle = {
        id: `gravity_flash_${Date.now()}_${i}`,
        pos: {
          x: pos.x + Math.cos(dir) * 0.6,
          y: pos.y + Math.sin(dir) * 0.6,
          z: pos.z
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: Math.sin(angle * 3) * 0.01
        },
        color: '#ff6b35',
        size: 3 + Math.random() * 4,
        lifetime: 300 + Math.random() * 200,
        maxLifetime: 500,
        type: 'soul_fragment'
      };
      
      particles.push(particle);
    }
  }

  public getWeapon(index: number): Weapon | null {
    return this.weapons[index] || null;
  }

  public getWeaponCount(): number {
    return this.weapons.length;
  }

  public switchWeapon(player: Player, weaponIndex: number): void {
    if (weaponIndex >= 0 && weaponIndex < this.weapons.length) {
      player.activeWeapon = weaponIndex;
    }
  }
}
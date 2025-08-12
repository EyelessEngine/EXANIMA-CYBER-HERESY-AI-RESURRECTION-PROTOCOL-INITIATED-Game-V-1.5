import { GameState, Vector2, Vector3 } from '../types/game';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private rayCount: number = 320;
  private fov: number = Math.PI / 3;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  public render(gameState: GameState, isEPressed: boolean = false): void {
    this.clearScreen();
    
    if (gameState.gameMode === 'playing' || gameState.gameMode === 'paused') {
      this.renderWorld(gameState, isEPressed);
      this.renderParticles(gameState);
      this.renderHUD(gameState);
      this.renderWeaponSprite(gameState);
    } else if (gameState.gameMode === 'menu') {
      this.renderMenuBackground();
    } else if (gameState.gameMode === 'dead') {
      this.renderDeathScreen(gameState);
    } else if (gameState.gameMode === 'level_complete') {
      this.renderLevelCompleteScreen(gameState);
    }
    
    if (gameState.gameMode === 'paused') {
      this.renderPauseOverlay();
    }
  }

  private clearScreen(): void {
    // Create gradient background (cyberpunk sky)
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#1a0d2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private renderMenuBackground(): void {
    // Create a more atmospheric menu background
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height)
    );
    gradient.addColorStop(0, '#2d1b69');
    gradient.addColorStop(0.5, '#1a0d2e');
    gradient.addColorStop(1, '#0f0f23');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Add some atmospheric particles
    this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const size = Math.random() * 2 + 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private renderWorld(gameState: GameState, isEPressed: boolean = false): void {
    const player = gameState.player;
    const level = gameState.level;
    
    // --- Renderizar textura de piso antes de los muros ---
    this.renderFloorTexture(player, level);
    // Cast rays for 3D effect
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle = player.dir - this.fov / 2 + (i / this.rayCount) * this.fov;
      const hit = this.castRay(player.pos, rayAngle, level);
      
      if (hit) {
        this.renderWallSlice(i, hit, rayAngle - player.dir);
      }
    }
    
    // Render enemies
    gameState.enemies.forEach(enemy => {
      this.renderEnemy(enemy, player, level);
    });
    
    // Render sacred core interactuable
    // this.ensureSacredCoreSpriteLoaded();
    // if (level.interactables) {
    //   level.interactables.forEach(interactable => {
    //     if (interactable.type === 'sacred_core' && !interactable.activated && Renderer.sacredCoreSprite && Renderer.sacredCoreSprite.complete) {
    //       this.renderSacredCore(interactable, player);
    //     }
    //   });
    // }
    
    // Render memory fragments (tarjetas)
    if (level.interactables) {
      level.interactables.forEach(interactable => {
        if (interactable.type === 'data_reliquary' && !interactable.activated) {
          this.renderMemoryCard(interactable, player, level);
        }
      });
    }
    
    // Render projectiles
    gameState.projectiles.forEach(projectile => {
      this.renderProjectile(projectile, player);
    });

    // Render boss reward item
    if (level.interactables) {
      level.interactables.forEach(interactable => {
        if (interactable.type === 'boss_reward' && !interactable.activated) {
          this.renderBossReward(interactable, player);
        }
        if (interactable.type === 'secret_panel' && !interactable.activated) {
          this.renderSecretPanel(interactable, player, isEPressed);
        }
      });
    }
  }

  // Nueva función para textura de piso tipo cemento con grietas y charcos
  private renderFloorTexture(player: any, level: any): void {
    // Dibuja el piso en la mitad inferior de la pantalla
    const imgData = this.ctx.createImageData(this.width, this.height / 2);
    for (let y = 0; y < this.height / 2; y++) {
      for (let x = 0; x < this.width; x++) {
        // Coordenadas del mundo para el piso
        const relY = y / (this.height / 2);
        // Simula perspectiva: más lejos = más oscuro
        const dist = 1.5 / (relY + 0.15);
        // Coordenadas del mundo
        const worldX = player.pos.x + Math.cos(player.dir) * dist + (x - this.width / 2) / this.width * dist * 2.5;
        const worldY = player.pos.y + Math.sin(player.dir) * dist;
        // Base cemento gris
        let r = 90 + Math.floor(Math.random() * 8);
        let g = 90 + Math.floor(Math.random() * 8);
        let b = 95 + Math.floor(Math.random() * 10);
        // Grietas: líneas oscuras
        if (Math.abs(Math.sin(worldX * 2.2 + worldY * 3.1)) > 0.98 || Math.abs(Math.cos(worldX * 1.7 - worldY * 2.3)) > 0.985) {
          r = g = b = 40 + Math.floor(Math.random() * 10);
        }
        // Charcos: manchas azuladas y reflejo
        if (Math.sin(worldX * 1.3 + worldY * 2.7) > 0.97) {
          r = 70;
          g = 110;
          b = 160 + Math.floor(Math.random() * 30);
        }
        // Sombra por distancia
        const shadow = Math.max(0.3, 1 - dist / 12);
        r = Math.floor(r * shadow);
        g = Math.floor(g * shadow);
        b = Math.floor(b * shadow);
        const idx = (y * this.width + x) * 4;
        imgData.data[idx] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = 255;
      }
    }
    this.ctx.putImageData(imgData, 0, this.height / 2);
  }

  private castRay(origin: Vector3, angle: number, level: any): any {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const maxDistance = 20;
    const step = 0.1;
    
    for (let distance = 0; distance < maxDistance; distance += step) {
      const x = origin.x + dx * distance;
      const y = origin.y + dy * distance;
      
      const cellX = Math.floor(x);
      const cellY = Math.floor(y);
      
      if (cellX >= 0 && cellX < level.width && cellY >= 0 && cellY < level.height) {
        const wallType = level.walls[cellY][cellX];
        if (wallType !== 0) {
          return {
            distance,
            wallType,
            x,
            y,
            textureX: (x % 1 + y % 1) % 1
          };
        }
      }
    }
    
    return null;
  }

  private renderWallSlice(rayIndex: number, hit: any, relativeAngle: number): void {
    const distance = hit.distance * Math.cos(relativeAngle); // Fix fisheye effect
    const wallHeight = (this.height / 2) / distance;
    const wallTop = (this.height / 2) - wallHeight;
    const wallBottom = (this.height / 2) + wallHeight;
    
    const x = (rayIndex / this.rayCount) * this.width;
    const sliceWidth = this.width / this.rayCount;
    
    // Wall color based on type and distance
    let wallColor: string;
    switch (hit.wallType) {
      case 1:
        wallColor = this.getWallColor('#4a5568', distance); // Gothic stone
        break;
      case 2:
        wallColor = this.getWallColor('#00ffff', distance); // Cyber pillar
        break;
      default:
        wallColor = this.getWallColor('#2d3142', distance);
    }
    
    // Add neon glow effect for cyber elements
    if (hit.wallType === 2) {
      this.ctx.shadowColor = '#00ffff';
      this.ctx.shadowBlur = 10;
    } else {
      this.ctx.shadowBlur = 0;
    }
    
    this.ctx.fillStyle = wallColor;
    this.ctx.fillRect(x, wallTop, sliceWidth, wallBottom - wallTop);
    
    // Add texture details
    this.renderWallTexture(x, wallTop, sliceWidth, wallBottom - wallTop, hit);
  }

  private renderWallTexture(x: number, y: number, width: number, height: number, hit: any): void {
    // Simple texture simulation with vertical lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < 3; i++) {
      const lineX = x + (i + 1) * (width / 4);
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }
    
    // Add gothic details for stone walls
    if (hit.wallType === 1) {
      this.ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
      this.ctx.fillRect(x, y + height * 0.2, width, height * 0.1);
      this.ctx.fillRect(x, y + height * 0.7, width, height * 0.1);
    }
  }

  private getWallColor(baseColor: string, distance: number): string {
    const brightness = Math.max(0.2, 1 - distance / 15);
    const color = this.hexToRgb(baseColor);
    return `rgba(${Math.floor(color.r * brightness)}, ${Math.floor(color.g * brightness)}, ${Math.floor(color.b * brightness)}, 1)`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  // Sprite de enemigo (cargado una sola vez)
  private static enemySprites: Map<string, HTMLImageElement> = new Map();
  private static enemySpritesLoaded: Map<string, boolean> = new Map();

  private ensureEnemySpriteLoaded(enemyType: string = 'default'): void {
    if (!Renderer.enemySprites.has(enemyType)) {
      const sprite = new window.Image();
      let spritePath = 'src/assets/Enemigo_01.png'; // Default sprite
      
      // Asignar sprites según el tipo de enemigo
      switch (enemyType) {
        case 'cyber_monk':
        case 'floating_guardian':
        case 'eucharistic_drone':
        case 'incense_turret':
        case 'archbishop_null':
          spritePath = '/enemigo-01.png?v=4'; // Sprite blindado
          break;
        case 'neural_assassin':
        case 'biomech_dog':
        case 'cerebral_kamikaze':
          spritePath = '/enemigo-02.png?v=4'; // Sprite demoníaco
          break;
        case 'archbishop_null':
          spritePath = '/enemigo-03.png?v=4'; // Sprite especial para el boss
          break;
        default:
          spritePath = '/enemigo-01.png?v=4';
      }
      
      sprite.src = spritePath;
      sprite.onload = () => { 
        Renderer.enemySpritesLoaded.set(enemyType, true);
        console.log(`✅ Sprite de enemigo ${enemyType} cargado exitosamente desde ${spritePath}`);
      };
      sprite.onerror = () => {
        console.warn(`⚠️ Error cargando sprite para ${enemyType}, usando sprite por defecto`);
        // Cargar sprite por defecto si falla
        if (!Renderer.enemySprites.has('default')) {
          const defaultSprite = new window.Image();
          defaultSprite.src = '/enemigo-01.png?v=4';
          defaultSprite.onload = () => { Renderer.enemySpritesLoaded.set('default', true); };
          Renderer.enemySprites.set('default', defaultSprite);
        }
      };
      Renderer.enemySprites.set(enemyType, sprite);
    }
  }

  private renderEnemy(enemy: any, player: any, level: any): void {
    this.ensureEnemySpriteLoaded(enemy.type);
    
    // Obtener el sprite correcto para el tipo de enemigo
    const enemySprite = Renderer.enemySprites.get(enemy.type) || Renderer.enemySprites.get('default');
    const isLoaded = Renderer.enemySpritesLoaded.get(enemy.type) || Renderer.enemySpritesLoaded.get('default');
    
    // Debug: mostrar qué sprite se está usando
    if (enemy.type && !Renderer.enemySpritesLoaded.get(enemy.type)) {
      console.log(`🔄 Cargando sprite para enemigo tipo: ${enemy.type}`);
    }
    
    // Debug: mostrar información del sprite (solo una vez por tipo)
    if (!Renderer.enemySpritesLoaded.get(enemy.type)) {
      console.log(`🎮 Renderizando enemigo tipo: ${enemy.type} con nuevo sprite`);
    }
    
    if (!enemySprite || !isLoaded) return;
    
    // Solo dibujar si hay línea de visión
    if (!this.hasLineOfSight(player.pos, enemy.pos, level)) return;
    
    const dx = enemy.pos.x - player.pos.x;
    const dy = enemy.pos.y - player.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0.1) {
      const angle = Math.atan2(dy, dx) - player.dir;
      const normalizedAngle = this.normalizeAngle(angle);
      
      if (Math.abs(normalizedAngle) < this.fov / 2) {
        const screenX = (normalizedAngle + this.fov / 2) / this.fov * this.width;
        // Sprite más grande
        const enemySize = Math.max(32, 340 / distance); // antes 200
        const SPRITE_SHEET = enemySprite;
        const SPRITE_COLS = 6;
        const SPRITE_ROWS = 3;
        const spriteW = Math.floor(SPRITE_SHEET.width / SPRITE_COLS);
        const spriteH = Math.floor(SPRITE_SHEET.height / SPRITE_ROWS);
        
        let row = 0;
        if (enemy.state === 'attacking') row = 1;
        const animSpeed = row === 0 ? 8 : 6;
        const frame = Math.floor(performance.now() / (1000 / animSpeed)) % SPRITE_COLS;
        const sx = Math.round(frame * spriteW);
        const sy = Math.round(row * spriteH);
        const drawW = enemySize;
        const drawH = enemySize * (spriteH / spriteW);
        const x = Math.round(screenX - drawW / 2);
        
        // Ajustar para que el sprite "toque" el piso (parte inferior de la pantalla 3D)
        const floorY = this.height / 2 + Math.min(180, 220 / (distance + 0.2));
        // y = piso - altura del sprite (base del PNG alineada)
        const y = Math.round(floorY - drawH + 1);
        
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(SPRITE_SHEET, sx, sy, spriteW, spriteH, x, y, drawW, drawH);
        
        // Barra de vida roja
        const healthBarWidth = drawW * 0.8;
        const healthBarHeight = 6;
        const healthPercent = Math.max(0, Math.min(1, enemy.health / enemy.maxHealth));
        const barX = x + (drawW - healthBarWidth) / 2;
        const barY = y - healthBarHeight - 6;
        
        this.ctx.save();
        this.ctx.fillStyle = '#440000';
        this.ctx.fillRect(barX, barY, healthBarWidth, healthBarHeight);
        this.ctx.fillStyle = '#ff2222';
        this.ctx.fillRect(barX, barY, healthBarWidth * healthPercent, healthBarHeight);
        this.ctx.strokeStyle = '#aa0000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, healthBarWidth, healthBarHeight);
        this.ctx.restore();
      }
    }
  }

  private renderProjectile(projectile: any, player: any): void {
    // No dibujar láser
    return;
  }

  private renderParticles(gameState: GameState): void {
    gameState.particles.forEach(particle => {
      const dx = particle.pos.x - gameState.player.pos.x;
      const dy = particle.pos.y - gameState.player.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10) {
        const angle = Math.atan2(dy, dx) - gameState.player.dir;
        const normalizedAngle = this.normalizeAngle(angle);
        
        if (Math.abs(normalizedAngle) < this.fov / 2) {
          const screenX = (normalizedAngle + this.fov / 2) / this.fov * this.width;
          const screenY = this.height / 2 + (particle.pos.z - gameState.player.pos.z) * 100;
          
          const alpha = particle.lifetime / particle.maxLifetime;
          const size = particle.size * (1 / (distance + 1));
          
          this.ctx.globalAlpha = alpha;
          this.ctx.shadowColor = particle.color;
          this.ctx.shadowBlur = 5;
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.globalAlpha = 1;
          this.ctx.shadowBlur = 0;
        }
      }
    });
  }

  private renderHUD(gameState: GameState): void {
    const player = gameState.player;
    
    // Health bar
    this.renderBar(20, 20, 200, 20, player.health, player.maxHealth, '#ff0000', 'HEALTH');
    
    // Soul energy bar
    this.renderBar(20, 50, 200, 20, player.soulEnergy, player.maxSoulEnergy, '#9932cc', 'SOUL ENERGY');
    
    // Memory fragments
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`MEMORY FRAGMENTS: ${player.memoryFragments}/${player.maxMemoryFragments}`, 20, 100);
    
    // Crosshair
    this.renderCrosshair();
    
    // Score
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = '20px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`SCORE: ${gameState.score}`, this.width - 20, 30);
    
    // Level info
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`LEVEL: ${gameState.currentLevel}`, this.width - 20, 60);
    
    // Weapon info
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('BIOMECH RIFLE', this.width - 20, this.height - 60);
    this.ctx.fillText('UNLIMITED AMMO', this.width - 20, this.height - 40);
    
    // Dash cooldown indicator
    if (player.dashCooldown > 0) {
      const cooldownPercent = player.dashCooldown / 1000;
      this.ctx.fillStyle = `rgba(255, 255, 0, ${cooldownPercent})`;
      this.ctx.fillRect(this.width / 2 - 50, this.height - 100, 100 * (1 - cooldownPercent), 5);
    }

    // Objectives
    this.renderObjectives(gameState);
    // --- MINIMAPA ---
    this.renderMinimap(gameState);
  }

  // Minimap en la esquina inferior izquierda
  private renderMinimap(gameState: any): void {
    const level = gameState.level;
    const player = gameState.player;
    const enemies = gameState.enemies;
    const mapSize = 150; // px
    const cellSize = mapSize / level.width;
    const offsetX = 20;
    const offsetY = this.height - mapSize - 20;
    // Fondo
    this.ctx.save();
    this.ctx.globalAlpha = 0.85;
    this.ctx.fillStyle = '#181818';
    this.ctx.fillRect(offsetX - 4, offsetY - 4, mapSize + 8, mapSize + 8);
    this.ctx.globalAlpha = 1;
    // Paredes y pisos
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        let color = '#eaeaea'; // piso por defecto
        switch (level.floors[y][x]) {
          case 2: color = '#cbbf9a'; break; // data crypt
          case 6: color = '#b6fcb6'; break; // organic
          case 7: color = '#80ffff'; break; // holographic
          case 9: color = '#ffeeb3'; break; // arena
        }
        if (level.walls[y][x] !== 0) {
          switch (level.walls[y][x]) {
            case 1: color = '#338c33'; break; // motherboard
            case 2: color = '#00ffff'; break; // led glass
            case 3: color = '#888888'; break; // server pillar
            case 4: color = '#ffe066'; break; // sacred core
            case 5: color = '#993399'; break; // biomechanical
            case 8: color = '#7a3f00'; break; // rusted
          }
        }
        this.ctx.fillStyle = color;
        this.ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
      }
    }
    // Enemigos
    enemies.forEach((enemy: any) => {
      this.ctx.fillStyle = '#ff2222';
      this.ctx.beginPath();
      this.ctx.arc(offsetX + (enemy.pos.x + 0.5) * cellSize, offsetY + (enemy.pos.y + 0.5) * cellSize, cellSize * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    });
    // Jugador
    this.ctx.save();
    this.ctx.translate(offsetX + (player.pos.x + 0.5) * cellSize, offsetY + (player.pos.y + 0.5) * cellSize);
    this.ctx.rotate(player.dir);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, cellSize * 0.35, 0, Math.PI * 2);
    this.ctx.fill();
    // Flecha de dirección
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(cellSize * 0.7, 0);
    this.ctx.stroke();
    this.ctx.restore();
    this.ctx.restore();

    // Boss reward item
    if (gameState.level.interactables) {
      gameState.level.interactables.forEach((interactable: any) => {
        if (interactable.type === 'boss_reward' && !interactable.activated) {
          this.ctx.save();
          this.ctx.globalAlpha = 1;
          this.ctx.beginPath();
          this.ctx.arc(offsetX + (interactable.pos.x + 0.5) * cellSize, offsetY + (interactable.pos.y + 0.5) * cellSize, cellSize * 0.35, 0, Math.PI * 2);
          this.ctx.fillStyle = '#ffe066';
          this.ctx.shadowColor = '#00eaff';
          this.ctx.shadowBlur = 10;
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
          this.ctx.beginPath();
          this.ctx.arc(offsetX + (interactable.pos.x + 0.5) * cellSize, offsetY + (interactable.pos.y + 0.5) * cellSize, cellSize * 0.18, 0, Math.PI * 2);
          this.ctx.fillStyle = '#00eaff';
          this.ctx.fill();
          this.ctx.restore();
        }
      });
    }
  }

  private renderObjectives(gameState: GameState): void {
    const objectives = gameState.objectives;
    if (objectives.length === 0) return;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(this.width - 320, 100, 300, objectives.length * 25 + 20);

    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('OBJECTIVES:', this.width - 310, 120);

    objectives.forEach((objective, index) => {
      const y = 140 + index * 25;
      const color = objective.completed ? '#00ff00' : '#ffffff';
      const status = objective.completed ? '[✓]' : '[ ]';
      let desc = objective.description;
      // Si es el objetivo de fragmentos de memoria, actualiza el contador en el texto
      if (objective.id === 'recover_memory') {
        desc = `Recuperar fragmentos de memoria (${objective.progress}/${objective.maxProgress})`;
      }
      this.ctx.fillStyle = color;
      this.ctx.font = '12px monospace';
      this.ctx.fillText(`${status} ${desc}`, this.width - 310, y);
    });
  }

  private renderBar(x: number, y: number, width: number, height: number, current: number, max: number, color: string, label: string): void {
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x, y, width, height);
    
    // Border
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
    
    // Fill
    const fillWidth = (current / max) * width;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, fillWidth, height);
    
    // Label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(label, x, y - 5);
    
    // Value
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${Math.ceil(current)}/${max}`, x + width, y - 5);
  }

  private renderCrosshair(): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const size = 10;
    
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 2;
    
    // Horizontal line
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - size, centerY);
    this.ctx.lineTo(centerX + size, centerY);
    this.ctx.stroke();
    
    // Vertical line
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - size);
    this.ctx.lineTo(centerX, centerY + size);
    this.ctx.stroke();
    
    // Center dot
    this.ctx.fillStyle = '#00ffff';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderLevelCompleteScreen(gameState: GameState): void {
    this.ctx.fillStyle = 'rgba(0, 128, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('LEVEL COMPLETE', this.width / 2, this.height / 2 - 50);
    
    this.ctx.font = '24px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`Score: ${gameState.score}`, this.width / 2, this.height / 2 + 20);
    this.ctx.fillText('Advancing to next level...', this.width / 2, this.height / 2 + 60);
  }

  private renderDeathScreen(gameState: GameState): void {
    this.ctx.fillStyle = 'rgba(128, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = '48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SOUL CORRUPTED', this.width / 2, this.height / 2 - 50);
    
    this.ctx.font = '24px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`Final Score: ${gameState.score}`, this.width / 2, this.height / 2 + 20);
    this.ctx.fillText('Press R to Resurrect', this.width / 2, this.height / 2 + 60);
  }

  private renderPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
    
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press ESC to Continue', this.width / 2, this.height / 2 + 50);
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  // Dibuja un fragmento de memoria como tarjeta futurista
  private renderMemoryCard(interactable: any, player: any, level: any): void {
    const dx = interactable.pos.x - player.pos.x;
    const dy = interactable.pos.y - player.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 0.3) return; // No dibujar si está encima del jugador
    // --- Línea de visión: raycast para ver si hay paredes ---
    if (!this.hasLineOfSight(player.pos, interactable.pos, level)) return;
    const angle = Math.atan2(dy, dx) - player.dir;
    const normalizedAngle = this.normalizeAngle(angle);
    if (Math.abs(normalizedAngle) < this.fov / 2) {
      const screenX = (normalizedAngle + this.fov / 2) / this.fov * this.width;
      const cardSize = Math.max(32, 120 / distance);
      const centerY = this.height / 2 + cardSize * 0.7;
      // Tarjeta base
      this.ctx.save();
      this.ctx.shadowColor = '#00ffcc';
      this.ctx.shadowBlur = 16;
      this.ctx.strokeStyle = '#00ffcc';
      this.ctx.lineWidth = 3;
      this.ctx.fillStyle = '#101c1c';
      this.ctx.beginPath();
      this.ctx.moveTo(screenX - cardSize/2, centerY - cardSize*0.6);
      this.ctx.lineTo(screenX + cardSize/2, centerY - cardSize*0.6);
      this.ctx.lineTo(screenX + cardSize/2, centerY + cardSize*0.6);
      this.ctx.lineTo(screenX - cardSize/2, centerY + cardSize*0.6);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      // Circuitos
      this.ctx.shadowBlur = 0;
      this.ctx.strokeStyle = '#00ffe7';
      this.ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(screenX - cardSize/2 + 8 + i*cardSize/5, centerY - cardSize*0.6 + 8);
        this.ctx.lineTo(screenX - cardSize/2 + 8 + i*cardSize/5, centerY + cardSize*0.6 - 8);
        this.ctx.stroke();
      }
      // Chip central
      this.ctx.fillStyle = '#00ffcc';
      this.ctx.fillRect(screenX - 10, centerY - 12, 20, 24);
      this.ctx.strokeStyle = '#0ff';
      this.ctx.strokeRect(screenX - 10, centerY - 12, 20, 24);
      // Letras
      this.ctx.font = `${Math.floor(cardSize/5)}px monospace`;
      this.ctx.fillStyle = '#00ffe7';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('MEMORY', screenX, centerY + cardSize*0.35);
      this.ctx.restore();
    }
  }

  // Raycast simple para línea de visión entre dos puntos (sin paredes)
  private hasLineOfSight(from: any, to: any, level: any): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(distance * 8);
    const stepX = dx / steps;
    const stepY = dy / steps;
    for (let i = 1; i < steps; i++) {
      const checkX = from.x + stepX * i;
      const checkY = from.y + stepY * i;
      const cellX = Math.floor(checkX);
      const cellY = Math.floor(checkY);
      if (cellX >= 0 && cellX < level.width && cellY >= 0 && cellY < level.height) {
        if (level.walls[cellY][cellX] !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  // Sprite de pistola (cargado una sola vez)
  private static pistolSprite: HTMLImageElement | null = null;
  private static pistolSpriteLoaded: boolean = false;

  private ensurePistolSpriteLoaded(): void {
    if (!Renderer.pistolSprite) {
      Renderer.pistolSprite = new window.Image();
      Renderer.pistolSprite.src = 'src/assets/pistol_sprite.png';
      Renderer.pistolSprite.onload = () => { Renderer.pistolSpriteLoaded = true; };
    }
  }

  // Dibuja el sprite de pistola animado en la parte inferior central
  private renderWeaponSprite(gameState: GameState): void {
    this.ensurePistolSpriteLoaded();
    if (!Renderer.pistolSprite || !Renderer.pistolSprite.complete) return;
    const w = this.width;
    const h = this.height;
    // Sprite sheet: 5 frames horizontales
    const SPRITE_W = Renderer.pistolSprite.width / 5;
    const SPRITE_H = Renderer.pistolSprite.height;
    const frame = Math.max(0, Math.min(4, gameState.player.weaponAnimFrame || 0));
    const drawW = Math.floor(w * 0.16); // 50% más pequeño
    const drawH = Math.floor(drawW * (SPRITE_H / SPRITE_W));
    // Posición: 60% a la derecha
    const x = Math.floor(w * 0.6 - drawW / 2); // 60% del ancho
    const y = Math.round(h - drawH + drawH * 0.30); // más abajo
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      Renderer.pistolSprite,
      SPRITE_W * frame, 0, SPRITE_W, SPRITE_H,
      x, y, drawW, drawH
    );
    this.ctx.restore();
  }

  // Sprite del núcleo sagrado (cargado una sola vez)
  private static sacredCoreSprite: HTMLImageElement | null = null;
  private static sacredCoreSpriteLoaded: boolean = false;
  private ensureSacredCoreSpriteLoaded(): void {
    if (!Renderer.sacredCoreSprite) {
      Renderer.sacredCoreSprite = new window.Image();
      Renderer.sacredCoreSprite.src = 'src/assets/nucleo_sagrado.png';
      Renderer.sacredCoreSprite.onload = () => { Renderer.sacredCoreSpriteLoaded = true; };
    }
  }

  // Dibuja el núcleo sagrado usando el primer frame del sprite
  private renderSacredCore(interactable: any, player: any): void {
    const dx = interactable.pos.x - player.pos.x;
    const dy = interactable.pos.y - player.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0.1 && Renderer.sacredCoreSprite) {
      const angle = Math.atan2(dy, dx) - player.dir;
      const normalizedAngle = this.normalizeAngle(angle);
      if (Math.abs(normalizedAngle) < this.fov / 2) {
        const screenX = (normalizedAngle + this.fov / 2) / this.fov * this.width;
        const size = Math.max(32, 120 / distance);
        const centerY = this.height / 2 + size * 0.5;
        const SPRITE = Renderer.sacredCoreSprite;
        const SPRITE_COLS = 3;
        const SPRITE_ROWS = 1;
        const spriteW = Math.floor(SPRITE.width / SPRITE_COLS);
        const spriteH = SPRITE.height;
        const sx = 0; // primer frame
        const sy = 0;
        const drawW = size;
        const drawH = size * (spriteH / spriteW);
        const x = Math.round(screenX - drawW / 2);
        const y = Math.round(centerY - drawH / 2);
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(SPRITE, sx, sy, spriteW, spriteH, x, y, drawW, drawH);
        this.ctx.restore();
      }
    }
  }

  // Dibuja el item especial del boss
  private renderBossReward(interactable: any, player: any): void {
    const dx = interactable.pos.x - player.pos.x;
    const dy = interactable.pos.y - player.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) - player.dir;
    const normalizedAngle = this.normalizeAngle(angle);
    if (Math.abs(normalizedAngle) < this.fov / 2) {
      const screenX = (normalizedAngle + this.fov / 2) / this.fov * this.width;
      const centerY = this.height / 2 + 40;
      const size = Math.max(32, 120 / (distance + 0.5));
      this.ctx.save();
      // Glow celeste
      this.ctx.shadowColor = '#00eaff';
      this.ctx.shadowBlur = 24;
      this.ctx.beginPath();
      this.ctx.arc(screenX, centerY, size * 0.5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffe066'; // dorado
      this.ctx.fill();
      // Círculo interior celeste
      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.arc(screenX, centerY, size * 0.28, 0, Math.PI * 2);
      this.ctx.fillStyle = '#00eaff';
      this.ctx.fill();
      // Detalle central dorado
      this.ctx.beginPath();
      this.ctx.arc(screenX, centerY, size * 0.13, 0, Math.PI * 2);
      this.ctx.fillStyle = '#fff7b2';
      this.ctx.fill();
      // Brillo
      this.ctx.globalAlpha = 0.7;
      this.ctx.beginPath();
      this.ctx.arc(screenX, centerY, size * 0.5, 0, Math.PI);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
      this.ctx.restore();
    }
  }

  // Modifica renderSecretPanel para recibir isEPressed
  private renderSecretPanel(interactable: any, player: any, isEPressed: boolean = false): void {
    const dx = interactable.pos.x - player.pos.x;
    const dy = interactable.pos.y - player.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 0.3) return;
    if (!this.hasLineOfSight(player.pos, interactable.pos, player.level || player)) return;
    const angle = Math.atan2(dy, dx) - player.dir;
    const normalizedAngle = this.normalizeAngle(angle);
    if (Math.abs(normalizedAngle) < this.fov / 2) {
      const screenX = (normalizedAngle + this.fov / 2) / this.fov * this.width;
      const size = Math.max(36, 120 / distance);
      const centerY = this.height / 2 + size * 0.5;
      this.ctx.save();
      this.ctx.shadowColor = '#d3d3d3';
      this.ctx.shadowBlur = 12;
      this.ctx.fillStyle = '#e6e7e9';
      this.ctx.strokeStyle = '#b0b0b0';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.roundRect(screenX - size/2, centerY - size*0.4, size, size*0.8, 12);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
      for (let i = 0; i < 3; i++) {
        this.ctx.beginPath();
        this.ctx.arc(screenX - size/4 + i*size/4, centerY + size*0.18, size*0.09, 0, Math.PI*2);
        // El círculo central se mantiene verde si el panel está activado
        const centralActive = interactable.activated || isEPressed;
        this.ctx.fillStyle = (i === 1 && centralActive) ? '#00ff88' : (i === 1 ? '#00cfff' : '#b0b0b0');
        this.ctx.fill();
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
      this.ctx.font = `${Math.floor(size/5)}px monospace`;
      this.ctx.fillStyle = '#444';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PANEL', screenX, centerY - size*0.18);
      this.ctx.restore();
    }
  }
}
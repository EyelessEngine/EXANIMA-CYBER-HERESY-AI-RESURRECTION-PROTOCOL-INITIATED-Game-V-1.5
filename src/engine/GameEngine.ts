import { GameState, Player, Enemy, Projectile, Particle, Level, Vector2, Vector3, Objective, Artifact } from '../types/game';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { Renderer } from './Renderer';
import { WeaponSystem } from './WeaponSystem';
import { EnemyAI } from './EnemyAI';
import { ParticleSystem } from './ParticleSystem';
import { LevelManager } from './LevelManager';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private renderer: Renderer;
  private weaponSystem: WeaponSystem;
  private enemyAI: EnemyAI;
  private particleSystem: ParticleSystem;
  private levelManager: LevelManager; // TODO: Remove this
  private lastTime: number = 0;
  private readonly targetFPS: number = 60;
  private readonly deltaTime: number = 1000 / this.targetFPS;
  private gameLoopRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.inputManager = new InputManager(canvas);
    this.audioManager = new AudioManager();
    this.renderer = new Renderer(canvas, this.ctx);
    this.weaponSystem = new WeaponSystem();
    this.enemyAI = new EnemyAI();
    this.particleSystem = new ParticleSystem();
    this.levelManager = new LevelManager();
    
    this.gameState = this.initializeGameState();
    this.setupEventListeners();
    
    // Start the game loop immediately but in menu mode
    if (!this.gameLoopRunning) {
      this.gameLoopRunning = true;
      this.gameLoop();
    }
  }

  private initializeGameState(): GameState {
    // Initialize with empty/default values for menu state
    return {
      player: {
        pos: { x: 4, y: 4, z: 0.5 },
        dir: 0,
        velocity: { x: 0, y: 0, z: 0 },
        health: 100,
        maxHealth: 100,
        soulEnergy: 50,
        maxSoulEnergy: 100,
        activeWeapon: 0,
        onGround: true,
        wallRunning: false,
        dashCooldown: 0,
        memoryFragments: 0,
        maxMemoryFragments: 3,
        hasGravityHook: false,
        timeSlowCooldown: 0,
        wallRunTime: 0,
        maxWallRunTime: 3000,
        weaponAnimFrame: 0, // Frame de animación del arma
        weaponAnimTime: 0 // Tiempo de animación del arma
      },
      enemies: [],
      projectiles: [],
      particles: [],
      level: this.createEmptyLevel(), // Empty level for menu
      gameTime: 0,
      score: 0,
      gameMode: 'menu', // Start in menu mode
      currentLevel: 1,
      objectives: [],
      artifacts: []
    };
  }

  private createEmptyLevel(): Level {
    return {
      id: 'menu_level',
      name: 'Menu',
      width: 10,
      height: 10,
      walls: Array(10).fill(null).map(() => Array(10).fill(0)),
      ceilings: Array(10).fill(null).map(() => Array(10).fill(1)),
      floors: Array(10).fill(null).map(() => Array(10).fill(1)),
      elevationMap: Array(10).fill(null).map(() => Array(10).fill(0)),
      spawnPoints: [{ x: 4, y: 4 }],
      secrets: [],
      textures: new Map(),
      ambientSounds: [],
      lightSources: [],
      interactables: []
    };
  }

  private initializeLevel(levelNumber: number): void {
    console.log(`Initializing level ${levelNumber}`);
    const level = this.levelManager.getLevel(levelNumber);
    if (!level) {
      console.error(`Level ${levelNumber} not found`);
      return;
    }

    this.gameState.level = level;
    this.gameState.enemies = this.spawnEnemies(level, levelNumber);
    this.gameState.projectiles = [];
    this.gameState.particles = [];
    this.gameState.objectives = this.levelManager.getLevelObjectives(levelNumber);
    this.gameState.artifacts = this.levelManager.getLevelArtifacts(levelNumber);
    this.gameState.currentLevel = levelNumber;
    
    // Reset player position and stats
    this.gameState.player.pos = { x: 4, y: 4, z: 0.5 };
    this.gameState.player.dir = 0;
    this.gameState.player.velocity = { x: 0, y: 0, z: 0 };
    this.gameState.player.health = this.gameState.player.maxHealth;
    this.gameState.player.soulEnergy = 50;
    this.gameState.player.memoryFragments = 0;
    this.gameState.player.onGround = true;
    this.gameState.player.wallRunning = false;
    this.gameState.player.dashCooldown = 0;
    this.gameState.player.timeSlowCooldown = 0;
    this.gameState.player.wallRunTime = 0;
    this.gameState.player.weaponAnimFrame = 0; // Reset weapon animation frame
    this.gameState.player.weaponAnimTime = 0; // Reset weapon animation time
    
    console.log(`Level ${levelNumber} initialized successfully`);
  }

  private spawnEnemies(level: Level, levelNumber: number): Enemy[] {
    const enemies: Enemy[] = [];
    const isValid = (x: number, y: number) => x >= 0 && x < level.width && y >= 0 && y < level.height && level.walls[y][x] === 0;
    function clamp(val: number, min: number, max: number) { return Math.max(min, Math.min(max, val)); }
    function findFreeCellNear(x: number, y: number) {
      x = clamp(Math.round(x), 0, level.width - 1);
      y = clamp(Math.round(y), 0, level.height - 1);
      if (isValid(x, y)) return { x, y };
      // Buscar en un radio pequeño
      for (let r = 1; r < 5; r++) {
        for (let dx = -r; dx <= r; dx++) {
          for (let dy = -r; dy <= r; dy++) {
            const nx = clamp(x + dx, 0, level.width - 1);
            const ny = clamp(y + dy, 0, level.height - 1);
            if (isValid(nx, ny)) return { x: nx, y: ny };
          }
        }
      }
      // Si no hay celda libre, usar el centro
      return { x: Math.floor(level.width/2), y: Math.floor(level.height/2) };
    }
    if (levelNumber === 1) {
      // Silicon Cathedral enemies
      let pos = findFreeCellNear(8, 8);
      enemies.push({
        id: 'cyber_monk_1',
        pos: { x: pos.x, y: pos.y, z: 0.5 },
        dir: Math.PI / 4,
        health: 60,
        maxHealth: 60,
        type: 'cyber_monk',
        state: 'patrolling',
        attackCooldown: 0,
        lastSeenPlayer: 0,
        patrolPoints: [{ x: 6, y: 6 }, { x: 12, y: 6 }, { x: 12, y: 12 }, { x: 6, y: 12 }],
        currentPatrolIndex: 0,
        specialAbility: 'plasma_lance',
        faction: 'tech_clergy'
      });
      pos = findFreeCellNear(15, 10);
      enemies.push({
        id: 'floating_guardian_1',
        pos: { x: pos.x, y: pos.y, z: 2.0 },
        dir: 0,
        health: 80,
        maxHealth: 80,
        type: 'floating_guardian',
        state: 'levitating',
        attackCooldown: 0,
        lastSeenPlayer: 0,
        patrolPoints: [{ x: 13, y: 8 }, { x: 17, y: 8 }, { x: 17, y: 12 }, { x: 13, y: 12 }],
        currentPatrolIndex: 0,
        specialAbility: 'energy_shield',
        faction: 'tech_clergy'
      });
      pos = findFreeCellNear(20, 15);
      enemies.push({
        id: 'eucharistic_drone_1',
        pos: { x: pos.x, y: pos.y, z: 1.5 },
        dir: Math.PI,
        health: 40,
        maxHealth: 40,
        type: 'eucharistic_drone',
        state: 'patrolling',
        attackCooldown: 0,
        lastSeenPlayer: 0,
        patrolPoints: [{ x: 18, y: 14 }, { x: 22, y: 14 }, { x: 22, y: 16 }, { x: 18, y: 16 }],
        currentPatrolIndex: 0,
        specialAbility: 'binary_chant',
        faction: 'tech_clergy'
      });
      pos = findFreeCellNear(12, 20);
      enemies.push({
        id: 'incense_turret_1',
        pos: { x: pos.x, y: pos.y, z: 0.5 },
        dir: 0,
        health: 100,
        maxHealth: 100,
        type: 'incense_turret',
        state: 'idle',
        attackCooldown: 0,
        lastSeenPlayer: 0,
        patrolPoints: [{ x: pos.x, y: pos.y }],
        currentPatrolIndex: 0,
        specialAbility: 'explosive_incense',
        faction: 'tech_clergy'
      });
      pos = findFreeCellNear(26, 26);
      enemies.push({
        id: 'archbishop_null',
        pos: { x: pos.x, y: pos.y, z: 1.0 },
        dir: Math.PI / 2,
        health: 300,
        maxHealth: 300,
        type: 'archbishop_null',
        state: 'idle',
        attackCooldown: 0,
        lastSeenPlayer: 0,
        patrolPoints: [{ x: 24, y: 24 }, { x: 28, y: 24 }, { x: 28, y: 28 }, { x: 24, y: 28 }],
        currentPatrolIndex: 0,
        specialAbility: 'neural_network_fusion',
        faction: 'tech_clergy'
      });
    } else if (levelNumber === 2) {
      // Neon Underworld enemies
      enemies.push({
        id: 'neural_assassin_1',
        pos: { x: 12, y: 12, z: 0.5 },
        dir: 0,
        health: 70,
        maxHealth: 70,
        type: 'neural_assassin',
        state: 'patrolling',
        attackCooldown: 0,
        lastSeenPlayer: 0,
        patrolPoints: [{ x: 10, y: 10 }, { x: 14, y: 10 }, { x: 14, y: 14 }, { x: 10, y: 14 }],
        currentPatrolIndex: 0,
        specialAbility: 'stealth_cloak',
        faction: 'cyber_mafia'
      });

      enemies.push({
        id: 'biomech_dog_1',
        pos: { x: 20, y: 8, z: 0.3 },
        dir: Math.PI / 3,
        health: 50,
        maxHealth: 50,
        type: 'biomech_dog',
        state: 'patrolling',
        attackCooldown: 0,
        lastSeenPlayer: 0,
        patrolPoints: [{ x: 18, y: 6 }, { x: 22, y: 6 }, { x: 22, y: 10 }, { x: 18, y: 10 }],
        currentPatrolIndex: 0,
        specialAbility: 'pack_hunt',
        faction: 'clone_factory'
      });

      enemies.push({
        id: 'cerebral_kamikaze_1',
        pos: { x: 8, y: 25, z: 0.5 },
        dir: Math.PI,
        health: 30,
        maxHealth: 30,
        type: 'cerebral_kamikaze',
        state: 'idle',
        attackCooldown: 0,
        lastSeenPlayer: 0,
        patrolPoints: [{ x: 8, y: 25 }],
        currentPatrolIndex: 0,
        specialAbility: 'brain_explosion',
        faction: 'oblivion_cult'
      });
    }
    
    return enemies;
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.togglePause();
      }
      if (e.code === 'KeyE' && this.gameState.gameMode === 'playing') {
        this.handleMemoryFragmentPickup();
      }
      if (e.code === 'KeyQ' && this.gameState.gameMode === 'playing') {
        this.activateTimeSlow();
      }
    });
  }

  // Normaliza un ángulo a [-PI, PI]
  private normalizeAngle(angle: number): number {
    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;
    return angle;
  }

  // Recoger fragmento de memoria solo si se apunta y presiona E
  private handleMemoryFragmentPickup(): void {
    const player = this.gameState.player;
    const level = this.gameState.level;
    // Buscar el fragmento más cercano al centro de la mira y con línea de visión
    let bestInteractable: import('../types/game').Interactable | null = null;
    let bestAngle = 0.2; // Solo si está cerca del centro de la mira (radianes)
    let bestDistance = 2.0;
    (level.interactables as import('../types/game').Interactable[]).forEach(interactable => {
      // Recoger fragmentos de memoria
      if (interactable.type === 'data_reliquary' && !interactable.activated) {
        const dx = interactable.pos.x - player.pos.x;
        const dy = interactable.pos.y - player.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 2.0) {
          // Línea de visión
          if (this.hasLineOfSight(player.pos, interactable.pos, level)) {
            const angle = Math.abs(this.normalizeAngle(Math.atan2(dy, dx) - player.dir));
            if (angle < bestAngle && distance < bestDistance) {
              bestInteractable = interactable;
              bestAngle = angle;
              bestDistance = distance;
            }
          }
        }
      }
      // Recoger boss_reward
      if (interactable.type === 'boss_reward' && !interactable.activated) {
        const dx = interactable.pos.x - player.pos.x;
        const dy = interactable.pos.y - player.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 1.2) { // muy cerca
          bestInteractable = interactable;
          bestAngle = 1; // forzar prioridad
          bestDistance = distance;
        }
      }
      // Recoger panel secreto
      if (interactable.type === 'secret_panel' && !interactable.activated) {
        const dx = interactable.pos.x - player.pos.x;
        const dy = interactable.pos.y - player.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 1.2) {
          bestInteractable = interactable;
          bestAngle = 1;
          bestDistance = distance;
        }
      }
    });
    if (bestInteractable) {
      // Forzar el tipo para TypeScript
      const interactable = bestInteractable as import('../types/game').Interactable;
      // Si es el item del boss, cumplir objetivo
      if (interactable.type === 'boss_reward') {
        interactable.activated = true;
        this.updateObjectiveProgress('steal_gospel', 1); // Cumple el objetivo correcto
        this.audioManager.playSound && this.audioManager.playSound('memory_recovered');
        // --- Generar panel secreto en la sala del boss ---
        if (!this.gameState.level.interactables.some(i => i.id === 'secret_panel')) {
          this.gameState.level.interactables.push({
            id: 'secret_panel',
            pos: { x: 36, y: 25 }, // pared norte de la nueva habitación del panel
            type: 'secret_panel',
            activated: false
          });
        }
        return;
      }
      this.activateInteractable(interactable);
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

  private activateInteractable(interactable: any): void {
    switch (interactable.type) {
      case 'data_reliquary':
        this.gameState.player.memoryFragments++;
        this.updateObjectiveProgress('recover_memory', 1);
        this.particleSystem.createMemoryFragmentEffect(
          { x: interactable.pos.x, y: interactable.pos.y, z: 1 },
          this.gameState.particles
        );
        this.audioManager.playSound('memory_recovered');
        break;
      case 'sacred_core':
        if (this.gameState.player.memoryFragments >= 3) {
          this.updateObjectiveProgress('deactivate_core', 1);
          this.audioManager.playSound('core_deactivated');
        }
        break;
      case 'gravity_rail':
        this.gameState.player.hasGravityHook = true;
        this.audioManager.playSound('gravity_hook_acquired');
        break;
      case 'secret_panel':
        this.updateObjectiveProgress('deactivate_core', 1);
        this.audioManager.playSound('core_deactivated');
        interactable.activated = true;
        break;
    }
    
    interactable.activated = true;
  }

  private activateTimeSlow(): void {
    if (this.gameState.player.timeSlowCooldown <= 0 && this.gameState.player.soulEnergy >= 30) {
      this.gameState.player.soulEnergy -= 30;
      this.gameState.player.timeSlowCooldown = 5000; // 5 second cooldown
      // Time slow effect would be implemented in update loop
      this.audioManager.playSound('time_slow_activated');
    }
  }

  private updateObjectiveProgress(objectiveId: string, progress: number): void {
    const objective = this.gameState.objectives.find(obj => obj.id === objectiveId);
    if (objective) {
      objective.progress += progress;
      if (objective.progress >= objective.maxProgress) {
        objective.completed = true;
        this.gameState.score += 500;
      }
    }
  }

  public start(): void {
    console.log('Starting game...');
    try {
      // Detener la música antes de iniciar
      this.audioManager.stopSound('rock_guitar_melody');
      this.audioManager.stopSound('level1_background');
      // Initialize the first level and start playing
      this.initializeLevel(1);
      this.gameState.gameMode = 'playing';
      // Resume audio context
      this.audioManager.resumeAudioContext();
      // La música ya no se inicia automáticamente aquí
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  // Permitir a React controlar la música
  public playMusic(): void {
    setTimeout(() => {
      // Usar música específica del nivel actual
      if (this.gameState.currentLevel === 1) {
        this.audioManager.playAmbientSound('level1_background');
      } else {
        this.audioManager.playAmbientSound('rock_guitar_melody');
      }
    }, 100);
  }
  public stopMusic(): void {
    this.audioManager.stopSound('rock_guitar_melody');
    this.audioManager.stopSound('level1_background');
  }

  public playMenuMusic(): void {
    setTimeout(() => {
      this.audioManager.stopSound('rock_guitar_melody');
      this.audioManager.playAmbientSound('menu_suspense');
    }, 100);
  }
  public stopMenuMusic(): void {
    this.audioManager.stopSound('menu_suspense');
  }

  private gameLoop = (currentTime: number = 0): void => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.gameState.gameMode === 'playing') {
      this.update(deltaTime);
    }
    
    this.render();
    
    if (this.gameLoopRunning) {
      requestAnimationFrame(this.gameLoop);
    }
  };

  private update(deltaTime: number): void {
    this.gameState.gameTime += deltaTime;
    // --- Abrir puerta del boss si el jugador tiene 3 fragmentos ---
    if (this.gameState.level && this.gameState.player.memoryFragments >= 3) {
      const bossDoor = this.gameState.level.interactables.find(i => i.type === 'boss_door');
      if (bossDoor && !bossDoor.activated) {
        bossDoor.activated = true;
        // Eliminar el muro de la puerta
        const { x, y } = bossDoor.pos;
        if (this.gameState.level.walls[y][x] === 9) {
          this.gameState.level.walls[y][x] = 0;
        }
        // (Opcional) reproducir sonido de puerta
        this.audioManager.playSound && this.audioManager.playSound('core_deactivated');
      }
    }
    
    // Update player
    this.updatePlayer(deltaTime);
    
    // Update enemies
    this.gameState.enemies.forEach(enemy => {
      this.enemyAI.updateEnemy(enemy, this.gameState.player, this.gameState.level, deltaTime);
    });
    
    // --- Núcleo sagrado aparece cuando todos los enemigos están muertos ---
    // const level = this.gameState.level;
    // const allDead = this.gameState.enemies.length > 0 && this.gameState.enemies.every(e => e.state === 'dead');
    // const coreExists = level.interactables.some(i => i.type === 'sacred_core');
    // if (allDead && !coreExists) {
    //   // Posición: centro del mapa
    //   const pos = { x: Math.floor(level.width / 2), y: Math.floor(level.height / 2) };
    //   level.interactables.push({ id: 'sacred_core', pos, type: 'sacred_core', activated: false });
    // }
    
    // Update projectiles
    this.updateProjectiles(deltaTime);
    
    // Update particles
    this.particleSystem.update(this.gameState.particles, deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Update cooldowns
    this.updateCooldowns(deltaTime);
    
    // Check level completion
    this.checkLevelCompletion();
    
    // --- Abrir puerta secreta si todos los objetivos menos 'deactivate_core' están completos ---
    if (this.gameState.level) {
      const secretDoor = this.gameState.level.interactables.find(i => i.type === 'secret_door');
      if (secretDoor && !secretDoor.activated) {
        const objectives = this.gameState.objectives;
        const allButCore = objectives.filter(obj => obj.id !== 'deactivate_core').every(obj => obj.completed);
        const coreIncomplete = objectives.find(obj => obj.id === 'deactivate_core' && !obj.completed);
        if (allButCore && coreIncomplete) {
          secretDoor.activated = true;
          const { x, y } = secretDoor.pos;
          if (this.gameState.level.walls[y][x] === 12) {
            this.gameState.level.walls[y][x] = 0;
          }
          this.audioManager.playSound && this.audioManager.playSound('core_deactivated');
        }
      }
    }
    
    // Clean up dead objects
    this.cleanup();
  }

  private updatePlayer(deltaTime: number): void {
    const player = this.gameState.player;
    const input = this.inputManager.getInput();
    // Animación de arma: avanzar frames si está activa
    if (player.weaponAnimFrame && player.weaponAnimFrame > 0) {
      player.weaponAnimTime = (player.weaponAnimTime || 0) + deltaTime;
      if (player.weaponAnimTime > 60) {
        player.weaponAnimFrame++;
        player.weaponAnimTime = 0;
        if (player.weaponAnimFrame > 3) {
          player.weaponAnimFrame = 0;
        }
      }
    }
    // Disparo: click izquierdo inicia animación
    if (input.mouseButtons.left && (!player.weaponAnimFrame || player.weaponAnimFrame === 0)) {
      player.weaponAnimFrame = 1;
      player.weaponAnimTime = 0;
    }
    
    // Enhanced movement with wall-running
    const moveSpeed = player.wallRunning ? 0.008 : 0.005;
    const rotateSpeed = 0.003;
    
    if (input.keys.KeyW) {
      player.pos.x += Math.cos(player.dir) * moveSpeed * deltaTime;
      player.pos.y += Math.sin(player.dir) * moveSpeed * deltaTime;
    }
    if (input.keys.KeyS) {
      player.pos.x -= Math.cos(player.dir) * moveSpeed * deltaTime;
      player.pos.y -= Math.sin(player.dir) * moveSpeed * deltaTime;
    }
    if (input.keys.KeyA) {
      player.pos.x += Math.cos(player.dir - Math.PI / 2) * moveSpeed * deltaTime;
      player.pos.y += Math.sin(player.dir - Math.PI / 2) * moveSpeed * deltaTime;
    }
    if (input.keys.KeyD) {
      player.pos.x += Math.cos(player.dir + Math.PI / 2) * moveSpeed * deltaTime;
      player.pos.y += Math.sin(player.dir + Math.PI / 2) * moveSpeed * deltaTime;
    }
    
    // Mouse look
    player.dir += input.mouseDelta.x * rotateSpeed;
    
    // Enhanced dash with gravity hook
    if (input.keys.ShiftLeft && player.dashCooldown <= 0) {
      const dashPower = player.hasGravityHook ? 0.03 : 0.02;
      player.pos.x += Math.cos(player.dir) * dashPower;
      player.pos.y += Math.sin(player.dir) * dashPower;
      player.dashCooldown = player.hasGravityHook ? 800 : 1000;
      
      this.particleSystem.createDashEffect(player.pos, player.dir, this.gameState.particles);
      this.audioManager.playSound('dash');
    }
    
    // Wall-running mechanics
    if (input.keys.KeyA || input.keys.KeyD) {
      const wallDirection = input.keys.KeyA ? -1 : 1;
      if (this.checkWallRunPossible(player, wallDirection)) {
        if (!player.wallRunning) {
          player.wallRunning = true;
          player.wallRunTime = 0;
          this.audioManager.playSound('wall_run_start');
        }
        player.wallRunTime += deltaTime;
        
        if (player.wallRunTime > player.maxWallRunTime) {
          player.wallRunning = false;
        }
      } else {
        player.wallRunning = false;
      }
    } else {
      player.wallRunning = false;
    }
    
    // Enhanced jump with wall-running
    if (input.keys.Space && (player.onGround || player.wallRunning)) {
      player.velocity.z = player.wallRunning ? 0.015 : 0.01;
      player.onGround = false;
      if (player.wallRunning) {
        player.wallRunning = false;
        this.audioManager.playSound('wall_jump');
      }
    }
    
    // Apply gravity
    if (!player.onGround && !player.wallRunning) {
      player.velocity.z -= 0.0005 * deltaTime;
      player.pos.z += player.velocity.z * deltaTime;
      
      if (player.pos.z <= 0.5) {
        player.pos.z = 0.5;
        player.velocity.z = 0;
        player.onGround = true;
      }
    }
    
    // Wall collision
    this.checkWallCollision(player);
    
    // Weapon firing
    if (input.mouseButtons.left) {
      this.weaponSystem.fire(player, this.gameState.projectiles, this.gameState.particles);
    }

    // Verificar muerte del jugador
    if (player.health <= 0 && this.gameState.gameMode !== 'dead') {
      this.gameState.gameMode = 'dead';
      // Detener la música por completo
      this.audioManager.stopSound('rock_guitar_melody');
    }
  }

  private checkWallRunPossible(player: Player, direction: number): boolean {
    const checkX = player.pos.x + Math.cos(player.dir + Math.PI / 2 * direction) * 0.6;
    const checkY = player.pos.y + Math.sin(player.dir + Math.PI / 2 * direction) * 0.6;
    
    const cellX = Math.floor(checkX);
    const cellY = Math.floor(checkY);
    
    if (cellX >= 0 && cellX < this.gameState.level.width && 
        cellY >= 0 && cellY < this.gameState.level.height) {
      return this.gameState.level.walls[cellY][cellX] !== 0;
    }
    
    return false;
  }

  private checkWallCollision(player: Player): void {
    const level = this.gameState.level;
    const cellX = Math.floor(player.pos.x);
    const cellY = Math.floor(player.pos.y);
    
    if (cellX >= 0 && cellX < level.width && cellY >= 0 && cellY < level.height) {
      if (level.walls[cellY][cellX] !== 0) {
        const centerX = cellX + 0.5;
        const centerY = cellY + 0.5;
        const diffX = player.pos.x - centerX;
        const diffY = player.pos.y - centerY;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
          player.pos.x = centerX + (diffX > 0 ? 0.5 : -0.5);
        } else {
          player.pos.y = centerY + (diffY > 0 ? 0.5 : -0.5);
        }
      }
    }
  }

  private updateProjectiles(deltaTime: number): void {
    this.gameState.projectiles.forEach(projectile => {
      projectile.pos.x += projectile.velocity.x * deltaTime;
      projectile.pos.y += projectile.velocity.y * deltaTime;
      projectile.pos.z += projectile.velocity.z * deltaTime;
      projectile.lifetime -= deltaTime;
      
      // Check wall collision
      const cellX = Math.floor(projectile.pos.x);
      const cellY = Math.floor(projectile.pos.y);
      
      if (cellX >= 0 && cellX < this.gameState.level.width && 
          cellY >= 0 && cellY < this.gameState.level.height) {
        if (this.gameState.level.walls[cellY][cellX] !== 0) {
          projectile.lifetime = 0;
          this.particleSystem.createImpactEffect(projectile.pos, this.gameState.particles);
          // Reproducir sonido de impacto con eco
          if (typeof window !== 'undefined' && (window as any).gameEngine && (window as any).gameEngine.audioManager) {
            (window as any).gameEngine.audioManager.playSound('laser_impact_echo');
          }
        }
      }
    });
  }

  private checkCollisions(): void {
    // Projectile vs Enemy collisions
    this.gameState.projectiles.forEach(projectile => {
      if (projectile.owner === 'player') {
        this.gameState.enemies.forEach(enemy => {
          const distance = Math.sqrt(
            Math.pow(projectile.pos.x - enemy.pos.x, 2) +
            Math.pow(projectile.pos.y - enemy.pos.y, 2)
          );
          if (distance < 0.5 && enemy.state !== 'dead') {
            enemy.health -= projectile.damage;
            projectile.lifetime = 0;
            if (enemy.health <= 0) {
              enemy.state = 'dead';
              this.particleSystem.createDeathEffect(enemy.pos, this.gameState.particles);
              this.audioManager.playSound('enemy_death');
              // Check boss defeat
              if (enemy.type === 'archbishop_null') {
                this.updateObjectiveProgress('defeat_archbishop', 1);
                // --- Generar item especial en el centro de la sala del boss ---
                const bossItem: import('../types/game').Interactable = {
                  id: 'archbishop_reward',
                  pos: { x: 25, y: 25 },
                  type: 'boss_reward',
                  activated: false
                };
                // Evitar duplicados
                if (!this.gameState.level.interactables.some(i => i.id === 'archbishop_reward')) {
                  this.gameState.level.interactables.push(bossItem);
                }
              }
            }
          }
        });
      }
    });
    
    // Enemy vs Player collisions
    this.gameState.enemies.forEach(enemy => {
      if (enemy.state === 'attacking') {
        const distance = Math.sqrt(
          Math.pow(enemy.pos.x - this.gameState.player.pos.x, 2) +
          Math.pow(enemy.pos.y - this.gameState.player.pos.y, 2)
        );
        
        if (distance < 1.0) {
          this.gameState.player.health -= this.getEnemyDamage(enemy.type);
          if (this.gameState.player.health <= 0) {
            this.gameState.gameMode = 'dead';
          }
        }
      }
    });
  }

  private getEnemyScore(enemyType: string): number {
    switch (enemyType) {
      case 'cyber_monk': return 150;
      case 'floating_guardian': return 200;
      case 'eucharistic_drone': return 100;
      case 'incense_turret': return 250;
      case 'neural_assassin': return 180;
      case 'biomech_dog': return 120;
      case 'cerebral_kamikaze': return 80;
      case 'archbishop_null': return 1000;
      default: return 100;
    }
  }

  private getEnemyDamage(enemyType: string): number {
    switch (enemyType) {
      case 'cyber_monk': return 15;
      case 'floating_guardian': return 20;
      case 'eucharistic_drone': return 10;
      case 'incense_turret': return 25;
      case 'neural_assassin': return 30;
      case 'biomech_dog': return 18;
      case 'cerebral_kamikaze': return 50;
      case 'archbishop_null': return 40;
      default: return 15;
    }
  }

  private updateCooldowns(deltaTime: number): void {
    const player = this.gameState.player;
    
    if (player.dashCooldown > 0) {
      player.dashCooldown -= deltaTime;
    }
    
    if (player.timeSlowCooldown > 0) {
      player.timeSlowCooldown -= deltaTime;
    }
    
    // Regenerate soul energy
    if (player.soulEnergy < player.maxSoulEnergy) {
      player.soulEnergy += 0.01 * deltaTime;
      player.soulEnergy = Math.min(player.soulEnergy, player.maxSoulEnergy);
    }
  }

  private checkLevelCompletion(): void {
    const allObjectivesComplete = this.gameState.objectives.every(obj => obj.completed);
    
    if (allObjectivesComplete && this.gameState.gameMode === 'playing') {
      this.gameState.gameMode = 'level_complete';
      this.audioManager.playSound('level_complete');
      
      // Advance to next level after delay
      setTimeout(() => {
        this.advanceToNextLevel();
      }, 3000);
    }
  }

  private advanceToNextLevel(): void {
    this.gameState.currentLevel++;
    const nextLevel = this.levelManager.getLevel(this.gameState.currentLevel);
    
    if (nextLevel) {
      this.initializeLevel(this.gameState.currentLevel);
      this.gameState.gameMode = 'playing';
      
      // Play level-specific ambient sound
      if (this.gameState.currentLevel === 2) {
        this.audioManager.stopSound('level1_background');
        this.audioManager.playAmbientSound('industrial_metal');
      }
    }
  }

  private cleanup(): void {
    this.gameState.projectiles = this.gameState.projectiles.filter(p => p.lifetime > 0);
    this.gameState.particles = this.gameState.particles.filter(p => p.lifetime > 0);
    this.gameState.enemies = this.gameState.enemies.filter(e => e.state !== 'dead');
  }

  private render(): void {
    // Obtener el estado de la tecla E
    const input = this.inputManager.getInput();
    const isEPressed = !!input.keys['KeyE'];
    // Pasar el estado de la tecla E al render
    this.renderer.render(this.gameState, isEPressed);
  }

  private togglePause(): void {
    if (this.gameState.gameMode === 'playing') {
      this.gameState.gameMode = 'paused';
    } else if (this.gameState.gameMode === 'paused') {
      this.gameState.gameMode = 'playing';
    }
  }

  public getGameState(): GameState {
    // Retorna una copia profunda del estado para evitar problemas de referencia compartida
    return JSON.parse(JSON.stringify(this.gameState));
  }

  public destroy(): void {
    this.gameLoopRunning = false;
  }

  public setMusicVolume(volume: number): void {
    if (this.audioManager) {
      this.audioManager.setMusicVolume(volume);
    }
  }

  public setSfxVolume(volume: number): void {
    this.audioManager.setSfxVolume(volume);
  }
}
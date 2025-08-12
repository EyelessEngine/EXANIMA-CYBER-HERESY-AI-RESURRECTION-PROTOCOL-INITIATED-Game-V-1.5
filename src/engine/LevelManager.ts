import { Level, Vector2, LightSource, Interactable, Objective, Artifact } from '../types/game';

export class LevelManager {
  private levels: Map<number, Level> = new Map();

  constructor() {
    this.initializeLevels();
  }

  private initializeLevels(): void {
    this.levels.set(1, this.createSiliconCathedral());
    this.levels.set(2, this.createNeonUnderworld());
  }

  private createSiliconCathedral(): Level {
    const width = 30;
    const height = 30;
    
    const walls = Array(height).fill(null).map(() => Array(width).fill(0));
    const ceilings = Array(height).fill(null).map(() => Array(width).fill(1));
    const floors = Array(height).fill(null).map(() => Array(width).fill(1));
    const elevationMap = Array(height).fill(null).map(() => Array(width).fill(0));
    
    // Create floating cathedral structure
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Outer walls
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          walls[y][x] = 1; // Motherboard walls
        }
        
        // Central nave with LED stained glass
        if (x >= 10 && x <= 20 && y >= 5 && y <= 25) {
          if (x === 10 || x === 20) {
            walls[y][x] = 2; // LED stained glass walls
          }
        }
        
        // Server rack pillars
        if ((x % 6 === 0 && y % 6 === 0) && x > 0 && x < width - 1 && y > 0 && y < height - 1) {
          walls[y][x] = 3; // Server rack pillars
          elevationMap[y][x] = 2; // Elevated platforms
        }
        
        // Data crypt (starting area)
        if (x >= 2 && x <= 6 && y >= 2 && y <= 6) {
          walls[y][x] = 0;
          floors[y][x] = 2; // Data crypt floor
        }
        
        // Sacred core chamber y boss room (más grande y hueca por dentro)
        if (x >= 22 && x <= 28 && y >= 22 && y <= 28) {
          if (x === 22 || x === 28 || y === 22 || y === 28) {
            walls[y][x] = 4; // Pared exterior
          } else {
            walls[y][x] = 0; // Interior vacío
          }
          elevationMap[y][x] = 3; // Highest elevation
        }
        // Puerta de la cámara del Arzobispo Null (ajustada)
        if (x === 22 && y === 25) {
          walls[y][x] = 9; // Tipo especial: puerta cerrada
        }

        // --- Nueva Habitación 1: Cámara biomecánica ---
        // Paredes: biomechanical_wall (5), Piso: organic_floor (6)
        if (x >= 2 && x <= 6 && y >= 22 && y <= 26) {
          if (x === 2 || x === 6 || y === 22 || y === 26) {
            walls[y][x] = 5; // Biomechanical wall
          } else {
            walls[y][x] = 0;
          }
          floors[y][x] = 6; // Organic floor
        }
        // Puerta de acceso
        if (x === 4 && y === 22) {
          walls[y][x] = 0;
        }

        // --- Nueva Habitación 2: Sala de vitrales LED ---
        // Paredes: led_stained_glass (2), Piso: holographic_floor (7)
        if (x >= 22 && x <= 26 && y >= 2 && y <= 6) {
          if (x === 22 || x === 26 || y === 2 || y === 6) {
            walls[y][x] = 2; // LED stained glass wall
          } else {
            walls[y][x] = 0;
          }
          floors[y][x] = 7; // Holographic floor
        }
        // Puerta de acceso
        if (x === 24 && y === 6) {
          walls[y][x] = 0;
        }

        // --- Nueva Habitación 3: Sala oxidada ---
        // Paredes: rusted_metal (8), Piso: arena_floor (9)
        if (x >= 12 && x <= 16 && y >= 27 && y <= 29) {
          if (x === 12 || x === 16 || y === 27 || y === 29) {
            walls[y][x] = 8; // Rusted metal wall
          } else {
            walls[y][x] = 0;
          }
          floors[y][x] = 9; // Arena floor
        }
        // Puerta de acceso
        if (x === 14 && y === 27) {
          walls[y][x] = 0;
        }

        // --- Nueva Habitación secreta conectada a la sala del arzobispo Null ---
        // Paredes: secret_wall (10), Piso: secret_floor (11)
        if (x >= 29 && x <= 34 && y >= 23 && y <= 29) {
          if (x === 29 || x === 34 || y === 23 || y === 29) {
            walls[y][x] = 10; // Secret wall
          } else {
            walls[y][x] = 0;
          }
          floors[y][x] = 11; // Secret floor
        }
        // Puerta secreta entre sala del boss y nueva habitación
        if (x === 28 && y === 26) {
          walls[y][x] = 12; // Secret door cerrada
        }

        // --- Nueva habitación para el panel, conectada a la habitación secreta ---
        // Paredes: secret_wall (10), Piso: secret_floor (11)
        if (x >= 35 && x <= 37 && y >= 25 && y <= 27) {
          if (x === 35 || x === 37 || y === 25 || y === 27) {
            walls[y][x] = 10; // Secret wall
          } else {
            walls[y][x] = 0;
          }
          floors[y][x] = 11; // Secret floor
        }
        // Puerta entre habitación secreta y la del panel
        if (x === 34 && y === 26) {
          walls[y][x] = 0;
        }
      }
    }
    
    // Ampliar el mapa de texturas para las nuevas habitaciones
    const textures = new Map([
      [1, 'motherboard_wall'],
      [2, 'led_stained_glass'],
      [3, 'server_rack_pillar'],
      [4, 'sacred_core_wall'],
      [5, 'biomechanical_wall'],
      [6, 'organic_floor'],
      [7, 'holographic_floor'],
      [8, 'rusted_metal'],
      [9, 'boss_door'], // Nueva textura para la puerta
      [10, 'secret_wall'],
      [11, 'secret_floor'],
      [12, 'secret_door']
    ]);
    
    const lightSources: LightSource[] = [
      { pos: { x: 15, y: 15, z: 3 }, color: '#00ffff', intensity: 0.8, flickering: false, type: 'led_stained_glass' },
      { pos: { x: 6, y: 6, z: 1 }, color: '#ff6b35', intensity: 0.6, flickering: true, type: 'server_glow' },
      { pos: { x: 12, y: 8, z: 2 }, color: '#9932cc', intensity: 0.7, flickering: false, type: 'neon' },
      { pos: { x: 18, y: 22, z: 2 }, color: '#00ff00', intensity: 0.5, flickering: true, type: 'server_glow' },
      { pos: { x: 26, y: 26, z: 4 }, color: '#ffffff', intensity: 1.0, flickering: false, type: 'sacred_core' }
    ];
    
    const interactables: Interactable[] = [
      { id: 'data_reliquary_1', pos: { x: 8, y: 12 }, type: 'data_reliquary', activated: false },
      { id: 'data_reliquary_2', pos: { x: 22, y: 8 }, type: 'data_reliquary', activated: false },
      { id: 'data_reliquary_3', pos: { x: 12, y: 22 }, type: 'data_reliquary', activated: false },
      { id: 'sacred_core', pos: { x: 26, y: 26 }, type: 'sacred_core', activated: false, requiredItem: 'memory_fragments' },
      { id: 'boss_door', pos: { x: 22, y: 25 }, type: 'boss_door', activated: false, requiredItem: 'memory_fragments' },
      { id: 'secret_door', pos: { x: 28, y: 26 }, type: 'secret_door', activated: false }
      // No panel aquí, se genera dinámicamente
    ];
    
    return {
      id: 'silicon_cathedral',
      name: 'Catedral de Silicio',
      width,
      height,
      walls,
      ceilings,
      floors,
      elevationMap,
      spawnPoints: [
        { x: 4, y: 4 }, // Data crypt spawn
        { x: 8, y: 8 }, // Cyber monk spawn
        { x: 15, y: 10 }, // Guardian spawn
        { x: 20, y: 15 }, // Drone spawn
        { x: 12, y: 20 }, // Turret spawn
        { x: 25, y: 25 } // Archbishop Null spawn (nuevo centro de la sala)
      ],
      secrets: [
        {
          bounds: { x: 5, y: 15, width: 3, height: 3 },
          discovered: false,
          reward: 'memory_fragment'
        },
        {
          bounds: { x: 18, y: 5, width: 2, height: 2 },
          discovered: false,
          reward: 'weapon_upgrade'
        }
      ],
      textures,
      ambientSounds: ['binary_chants', 'server_hum', 'digital_whispers'],
      lightSources,
      interactables
    };
  }

  private createNeonUnderworld(): Level {
    const width = 35;
    const height = 35;
    
    const walls = Array(height).fill(null).map(() => Array(width).fill(0));
    const ceilings = Array(height).fill(null).map(() => Array(width).fill(1));
    const floors = Array(height).fill(null).map(() => Array(width).fill(1));
    const elevationMap = Array(height).fill(null).map(() => Array(width).fill(0));
    
    // Create underground tunnel system
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Outer boundaries
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          walls[y][x] = 1; // Rusted metal walls
        }
        
        // Main tunnel network
        if ((x >= 5 && x <= 30 && y === 10) || 
            (x >= 5 && x <= 30 && y === 25) ||
            (x === 10 && y >= 5 && y <= 30) ||
            (x === 25 && y >= 5 && y <= 30)) {
          walls[y][x] = 0; // Open tunnels
          floors[y][x] = 2; // Grated metal floors
        }
        
        // Spiral gothic columns
        if ((x - 15) * (x - 15) + (y - 15) * (y - 15) === 25) {
          walls[y][x] = 2; // Gothic spiral columns
          elevationMap[y][x] = 3;
        }
        
        // Suspended train tracks
        if (y === 8 || y === 27) {
          if (x >= 8 && x <= 27) {
            elevationMap[y][x] = 4; // Elevated train tracks
          }
        }
        
        // Clone factory area
        if (x >= 28 && x <= 32 && y >= 28 && y <= 32) {
          walls[y][x] = 3; // Biomechanical walls
          floors[y][x] = 3; // Organic floor
        }
        
        // Cyber mafia hideout
        if (x >= 2 && x <= 8 && y >= 2 && y <= 8) {
          walls[y][x] = 4; // Neon-lit walls
          floors[y][x] = 4; // Holographic floor
        }
        
        // Central arena
        if ((x - 17) * (x - 17) + (y - 17) * (y - 17) <= 16) {
          walls[y][x] = 0;
          floors[y][x] = 5; // Arena floor
          elevationMap[y][x] = 1;
        }
      }
    }
    
    const textures = new Map([
      [1, 'rusted_metal'],
      [2, 'gothic_spiral_column'],
      [3, 'biomechanical_wall'],
      [4, 'neon_graffiti_wall'],
      [5, 'bone_steel_door']
    ]);
    
    const lightSources: LightSource[] = [
      { pos: { x: 5, y: 5, z: 2 }, color: '#ff0080', intensity: 0.7, flickering: true, type: 'broken_neon' },
      { pos: { x: 15, y: 8, z: 4 }, color: '#00ffff', intensity: 0.6, flickering: false, type: 'neon' },
      { pos: { x: 25, y: 15, z: 2 }, color: '#ffff00', intensity: 0.8, flickering: true, type: 'broken_neon' },
      { pos: { x: 30, y: 30, z: 1 }, color: '#ff6b35', intensity: 0.5, flickering: false, type: 'biomech_glow' },
      { pos: { x: 17, y: 17, z: 2 }, color: '#9932cc', intensity: 0.9, flickering: false, type: 'arena_light' }
    ];
    
    const interactables: Interactable[] = [
      { id: 'gravity_rail_1', pos: { x: 10, y: 8 }, type: 'gravity_rail', activated: false },
      { id: 'gravity_rail_2', pos: { x: 25, y: 27 }, type: 'gravity_rail', activated: false },
      { id: 'biometric_door_1', pos: { x: 15, y: 15 }, type: 'biometric_door', activated: false, requiredItem: 'eye_of_oblivion' },
      { id: 'memory_terminal', pos: { x: 30, y: 30 }, type: 'memory_terminal', activated: false }
    ];
    
    return {
      id: 'neon_underworld',
      name: 'Submundo de Neón',
      width,
      height,
      walls,
      ceilings,
      floors,
      elevationMap,
      spawnPoints: [
        { x: 5, y: 5 }, // Player spawn
        { x: 12, y: 12 }, // Neural assassin spawn
        { x: 20, y: 8 }, // Biomech dog spawn
        { x: 8, y: 25 }, // Kamikaze spawn
        { x: 30, y: 30 }, // Clone factory spawn
        { x: 17, y: 17 } // Central arena spawn
      ],
      secrets: [
        {
          bounds: { x: 3, y: 15, width: 2, height: 2 },
          discovered: false,
          reward: 'artifact'
        },
        {
          bounds: { x: 32, y: 3, width: 2, height: 2 },
          discovered: false,
          reward: 'weapon_upgrade'
        }
      ],
      textures,
      ambientSounds: ['industrial_metal', 'broken_neon_buzz', 'distant_screams', 'train_rumble'],
      lightSources,
      interactables
    };
  }

  public getLevel(levelNumber: number): Level | null {
    return this.levels.get(levelNumber) || null;
  }

  public getLevelObjectives(levelNumber: number): Objective[] {
    switch (levelNumber) {
      case 1:
        return [
          {
            id: 'recover_memory',
            description: 'Recuperar fragmentos de memoria (0/3)',
            completed: false,
            type: 'collect',
            target: 'memory_fragments',
            progress: 0,
            maxProgress: 3
          },
          {
            id: 'deactivate_core',
            description: 'Desactivar el núcleo sagrado',
            completed: false,
            type: 'hack',
            target: 'sacred_core',
            progress: 0,
            maxProgress: 1
          },
          {
            id: 'steal_gospel',
            description: 'Robar el Evangelio del Código',
            completed: false,
            type: 'collect',
            target: 'code_gospel',
            progress: 0,
            maxProgress: 1
          },
          {
            id: 'defeat_archbishop',
            description: 'Derrotar al Arzobispo Null',
            completed: false,
            type: 'destroy',
            target: 'archbishop_null',
            progress: 0,
            maxProgress: 1
          }
        ];
      case 2:
        return [
          {
            id: 'extract_eye',
            description: 'Extraer el Ojo del Olvido',
            completed: false,
            type: 'extract',
            target: 'eye_of_oblivion',
            progress: 0,
            maxProgress: 1
          },
          {
            id: 'survive_ambush',
            description: 'Sobrevivir a la emboscada de tres facciones',
            completed: false,
            type: 'survive',
            target: 'faction_ambush',
            progress: 0,
            maxProgress: 180000 // 3 minutes
          },
          {
            id: 'wall_run_mastery',
            description: 'Dominar el wall-run en trenes suspendidos',
            completed: false,
            type: 'collect',
            target: 'wall_run_points',
            progress: 0,
            maxProgress: 5
          }
        ];
      default:
        return [];
    }
  }

  public getLevelArtifacts(levelNumber: number): Artifact[] {
    switch (levelNumber) {
      case 1:
        return [
          {
            id: 'code_gospel',
            name: 'Evangelio del Código',
            description: 'Texto sagrado que contiene los secretos de la resurrección digital',
            collected: false,
            pos: { x: 26, y: 26 },
            effect: 'Desbloquea habilidades de hackeo avanzado'
          },
          {
            id: 'ionic_redeemer',
            name: 'Redentor Iónico',
            description: 'Escopeta biomecánica que purifica datos corrompidos',
            collected: false,
            pos: { x: 8, y: 12 },
            effect: 'Arma principal con munición infinita'
          }
        ];
      case 2:
        return [
          {
            id: 'eye_of_oblivion',
            name: 'Ojo del Olvido',
            description: 'Artefacto que permite ver a través de las ilusiones digitales',
            collected: false,
            pos: { x: 17, y: 17 },
            effect: 'Revela enemigos ocultos y pasajes secretos'
          },
          {
            id: 'gravity_hook',
            name: 'Gancho Gravitacional',
            description: 'Dispositivo que manipula la gravedad local',
            collected: false,
            pos: { x: 10, y: 8 },
            effect: 'Permite wall-run y movimiento vertical avanzado'
          }
        ];
      default:
        return [];
    }
  }
}
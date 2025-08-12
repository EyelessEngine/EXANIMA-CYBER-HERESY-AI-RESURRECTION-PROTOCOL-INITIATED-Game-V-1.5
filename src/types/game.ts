export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Player {
  pos: Vector3;
  dir: number;
  velocity: Vector3;
  health: number;
  maxHealth: number;
  soulEnergy: number;
  maxSoulEnergy: number;
  activeWeapon: number;
  onGround: boolean;
  wallRunning: boolean;
  dashCooldown: number;
  memoryFragments: number;
  maxMemoryFragments: number;
  hasGravityHook: boolean;
  timeSlowCooldown: number;
  wallRunTime: number;
  maxWallRunTime: number;
  // Animación de arma en primera persona
  weaponAnimFrame?: number;
  weaponAnimTime?: number;
}

export interface Enemy {
  id: string;
  pos: Vector3;
  dir: number;
  health: number;
  maxHealth: number;
  type: 'cyber_monk' | 'floating_guardian' | 'eucharistic_drone' | 'incense_turret' | 'neural_assassin' | 'biomech_dog' | 'cerebral_kamikaze' | 'archbishop_null';
  state: 'idle' | 'patrolling' | 'chasing' | 'attacking' | 'dead' | 'levitating' | 'charging';
  attackCooldown: number;
  lastSeenPlayer: number;
  patrolPoints: Vector2[];
  currentPatrolIndex: number;
  specialAbility?: string;
  faction?: 'tech_clergy' | 'cyber_mafia' | 'oblivion_cult' | 'clone_factory';
}

export interface Weapon {
  id: string;
  name: string;
  type: 'biomech_rifle' | 'soul_cannon' | 'neural_blade' | 'ionic_redeemer' | 'gravity_hook';
  damage: number;
  range: number;
  fireRate: number;
  soulCost: number;
  lastFired: number;
  ammo: number;
  maxAmmo: number;
  specialEffect?: 'data_purification' | 'gravity_pull' | 'time_slow';
}

export interface Projectile {
  id: string;
  pos: Vector3;
  velocity: Vector3;
  damage: number;
  type: 'plasma' | 'soul_bolt' | 'neural_spike' | 'ionic_blast' | 'gravity_hook';
  lifetime: number;
  owner: 'player' | 'enemy';
  specialEffect?: string;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  level: Level;
  gameTime: number;
  score: number;
  gameMode: 'playing' | 'paused' | 'menu' | 'dead' | 'level_complete';
  currentLevel: number;
  objectives: Objective[];
  artifacts: Artifact[];
}

export interface Particle {
  id: string;
  pos: Vector3;
  velocity: Vector3;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
  type: 'soul_fragment' | 'spark' | 'blood' | 'digital_decay' | 'binary_chant' | 'neon_glitch' | 'memory_fragment';
}

export interface Level {
  id: string;
  name: string;
  width: number;
  height: number;
  walls: number[][];
  ceilings: number[][];
  floors: number[][];
  spawnPoints: Vector2[];
  secrets: SecretArea[];
  textures: Map<number, string>;
  ambientSounds: string[];
  lightSources: LightSource[];
  interactables: Interactable[];
  elevationMap: number[][];
}

export interface SecretArea {
  bounds: { x: number; y: number; width: number; height: number };
  discovered: boolean;
  reward: 'health' | 'soul_energy' | 'weapon_upgrade' | 'memory_fragment' | 'artifact';
}

export interface LightSource {
  pos: Vector3;
  color: string;
  intensity: number;
  flickering: boolean;
  type: 'neon' | 'led_stained_glass' | 'server_glow' | 'plasma_torch' | 'broken_neon' | 'biomech_glow' | 'arena_light';
}

export interface Interactable {
  id: string;
  pos: Vector2;
  type: 'data_reliquary' | 'sacred_core' | 'biometric_door' | 'gravity_rail' | 'memory_terminal' | 'boss_door' | 'boss_reward' | 'secret_door' | 'secret_panel';
  activated: boolean;
  requiredItem?: string;
}

export interface Objective {
  id: string;
  description: string;
  completed: boolean;
  type: 'hack' | 'destroy' | 'collect' | 'survive' | 'extract';
  target?: string;
  progress: number;
  maxProgress: number;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  collected: boolean;
  pos?: Vector2;
  effect: string;
}
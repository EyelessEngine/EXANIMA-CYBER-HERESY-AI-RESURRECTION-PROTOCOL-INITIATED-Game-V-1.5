import { Enemy, Player, Level, Vector2 } from '../types/game';

export class EnemyAI {
  private readonly viewDistance = 8;
  private readonly attackDistance = 2;
  private readonly patrolSpeed = 0.001;
  private readonly chaseSpeed = 0.003;

  public updateEnemy(enemy: Enemy, player: Player, level: Level, deltaTime: number): void {
    if (enemy.state === 'dead') return;

    // Update cooldowns
    if (enemy.attackCooldown > 0) {
      enemy.attackCooldown -= deltaTime;
    }

    // Check if player is in sight
    const distanceToPlayer = this.getDistance(enemy.pos, player.pos);
    const canSeePlayer = this.canSeePlayer(enemy, player, level);

    // State machine
    switch (enemy.state) {
      case 'idle':
        this.handleIdleState(enemy, player, canSeePlayer, distanceToPlayer, deltaTime);
        break;
      case 'patrolling':
        this.handlePatrolState(enemy, player, canSeePlayer, distanceToPlayer, deltaTime);
        break;
      case 'chasing':
        this.handleChaseState(enemy, player, canSeePlayer, distanceToPlayer, deltaTime);
        break;
      case 'attacking':
        this.handleAttackState(enemy, player, distanceToPlayer, deltaTime);
        break;
    }

    // Face the player if chasing or attacking
    if (enemy.state === 'chasing' || enemy.state === 'attacking') {
      const dx = player.pos.x - enemy.pos.x;
      const dy = player.pos.y - enemy.pos.y;
      enemy.dir = Math.atan2(dy, dx);
    }
  }

  private handleIdleState(enemy: Enemy, player: Player, canSeePlayer: boolean, distanceToPlayer: number, deltaTime: number): void {
    if (canSeePlayer && distanceToPlayer < this.viewDistance) {
      enemy.state = 'chasing';
      enemy.lastSeenPlayer = Date.now();
    } else {
      // Randomly start patrolling
      if (Math.random() < 0.001) {
        enemy.state = 'patrolling';
      }
    }
  }

  private handlePatrolState(enemy: Enemy, player: Player, canSeePlayer: boolean, distanceToPlayer: number, deltaTime: number): void {
    if (canSeePlayer && distanceToPlayer < this.viewDistance) {
      enemy.state = 'chasing';
      enemy.lastSeenPlayer = Date.now();
      return;
    }

    // Move towards current patrol point
    const targetPoint = enemy.patrolPoints[enemy.currentPatrolIndex];
    const dx = targetPoint.x - enemy.pos.x;
    const dy = targetPoint.y - enemy.pos.y;
    const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

    if (distanceToTarget < 0.5) {
      // Reached patrol point, move to next
      enemy.currentPatrolIndex = (enemy.currentPatrolIndex + 1) % enemy.patrolPoints.length;
    } else {
      // Move towards patrol point
      const moveX = (dx / distanceToTarget) * this.patrolSpeed * deltaTime;
      const moveY = (dy / distanceToTarget) * this.patrolSpeed * deltaTime;
      
      enemy.pos.x += moveX;
      enemy.pos.y += moveY;
      enemy.dir = Math.atan2(dy, dx);
    }
  }

  private handleChaseState(enemy: Enemy, player: Player, canSeePlayer: boolean, distanceToPlayer: number, deltaTime: number): void {
    if (distanceToPlayer < this.attackDistance) {
      enemy.state = 'attacking';
      return;
    }

    if (!canSeePlayer && Date.now() - enemy.lastSeenPlayer > 3000) {
      // Lost player for 3 seconds, return to patrol
      enemy.state = 'patrolling';
      return;
    }

    if (canSeePlayer) {
      enemy.lastSeenPlayer = Date.now();
    }

    // Move towards player
    const dx = player.pos.x - enemy.pos.x;
    const dy = player.pos.y - enemy.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.1) {
      const moveX = (dx / distance) * this.chaseSpeed * deltaTime;
      const moveY = (dy / distance) * this.chaseSpeed * deltaTime;
      
      enemy.pos.x += moveX;
      enemy.pos.y += moveY;
    }
  }

  private handleAttackState(enemy: Enemy, player: Player, distanceToPlayer: number, deltaTime: number): void {
    if (distanceToPlayer > this.attackDistance * 1.5) {
      enemy.state = 'chasing';
      return;
    }

    // Attack logic would go here
    // For now, just apply damage periodically
    if (enemy.attackCooldown <= 0) {
      // Damage is applied in the main game loop collision detection
      enemy.attackCooldown = 1000; // 1 second between attacks
    }
  }

  private canSeePlayer(enemy: Enemy, player: Player, level: Level): boolean {
    const dx = player.pos.x - enemy.pos.x;
    const dy = player.pos.y - enemy.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > this.viewDistance) return false;

    // Simple line of sight check
    const steps = Math.floor(distance * 2);
    const stepX = dx / steps;
    const stepY = dy / steps;

    for (let i = 1; i < steps; i++) {
      const checkX = enemy.pos.x + stepX * i;
      const checkY = enemy.pos.y + stepY * i;
      
      const cellX = Math.floor(checkX);
      const cellY = Math.floor(checkY);
      
      if (cellX >= 0 && cellX < level.width && cellY >= 0 && cellY < level.height) {
        if (level.walls[cellY][cellX] !== 0) {
          return false; // Wall blocks line of sight
        }
      }
    }

    return true;
  }

  private getDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
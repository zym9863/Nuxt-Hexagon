import { ref, reactive } from 'vue'

/**
 * 向量接口定义
 */
export interface Vector2 {
  x: number
  y: number
}

/**
 * 物理球体接口定义
 */
export interface Ball {
  position: Vector2
  velocity: Vector2
  radius: number
  mass: number
}

/**
 * 物理参数配置
 */
export interface PhysicsConfig {
  gravity: number
  friction: number
  bounce: number
  airResistance: number
}

/**
 * 六边形顶点计算
 */
export function getHexagonVertices(centerX: number, centerY: number, radius: number, rotation: number): Vector2[] {
  const vertices: Vector2[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + rotation
    vertices.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    })
  }
  return vertices
}

/**
 * 向量运算工具函数
 */
export const VectorUtils = {
  // 向量加法
  add(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x + b.x, y: a.y + b.y }
  },

  // 向量减法
  subtract(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x - b.x, y: a.y - b.y }
  },

  // 向量乘法（标量）
  multiply(v: Vector2, scalar: number): Vector2 {
    return { x: v.x * scalar, y: v.y * scalar }
  },

  // 向量长度
  length(v: Vector2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y)
  },

  // 向量归一化
  normalize(v: Vector2): Vector2 {
    const len = this.length(v)
    if (len === 0) return { x: 0, y: 0 }
    return { x: v.x / len, y: v.y / len }
  },

  // 向量点积
  dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y
  },

  // 向量距离
  distance(a: Vector2, b: Vector2): number {
    return this.length(this.subtract(a, b))
  },

  // 向量反射
  reflect(incident: Vector2, normal: Vector2): Vector2 {
    const dotProduct = this.dot(incident, normal)
    return this.subtract(incident, this.multiply(normal, 2 * dotProduct))
  }
}

/**
 * 线段碰撞检测
 */
export function getLineSegmentClosestPoint(point: Vector2, lineStart: Vector2, lineEnd: Vector2): { closest: Vector2, distance: number } {
  const line = VectorUtils.subtract(lineEnd, lineStart)
  const pointToStart = VectorUtils.subtract(point, lineStart)

  const lineLength = VectorUtils.length(line)
  if (lineLength === 0) {
    return { closest: lineStart, distance: VectorUtils.distance(point, lineStart) }
  }

  const normalizedLine = VectorUtils.normalize(line)
  const projection = VectorUtils.dot(pointToStart, normalizedLine)

  // 限制投影在线段范围内
  const clampedProjection = Math.max(0, Math.min(lineLength, projection))

  const closest = VectorUtils.add(lineStart, VectorUtils.multiply(normalizedLine, clampedProjection))
  const distance = VectorUtils.distance(point, closest)

  return { closest, distance }
}

/**
 * 六边形碰撞检测
 */
export function checkHexagonCollision(ball: Ball, vertices: Vector2[]): { collision: boolean, normal?: Vector2, penetration?: number } {
  let minDistance = Infinity
  let collisionNormal: Vector2 | undefined
  let collisionPenetration = 0

  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i]
    const next = vertices[(i + 1) % vertices.length]

    const { closest, distance } = getLineSegmentClosestPoint(ball.position, current, next)

    if (distance < ball.radius && distance < minDistance) {
      minDistance = distance
      collisionPenetration = ball.radius - distance

      // 计算碰撞法线（从线段指向球心）
      const toCenter = VectorUtils.subtract(ball.position, closest)
      collisionNormal = VectorUtils.normalize(toCenter)
    }
  }

  return {
    collision: minDistance < ball.radius,
    normal: collisionNormal,
    penetration: collisionPenetration
  }
}

/**
 * 物理引擎 composable
 */
export function usePhysics() {
  // 默认物理参数
  const config = reactive<PhysicsConfig>({
    gravity: 0.5,      // 重力加速度
    friction: 0.98,    // 摩擦系数
    bounce: 0.8,       // 弹性系数
    airResistance: 0.999 // 空气阻力
  })

  /**
   * 应用重力
   */
  function applyGravity(ball: Ball, deltaTime: number): void {
    ball.velocity.y += config.gravity * deltaTime
  }

  /**
   * 应用空气阻力
   */
  function applyAirResistance(ball: Ball): void {
    ball.velocity = VectorUtils.multiply(ball.velocity, config.airResistance)
  }

  /**
   * 更新球的位置
   */
  function updatePosition(ball: Ball, deltaTime: number): void {
    ball.position = VectorUtils.add(ball.position, VectorUtils.multiply(ball.velocity, deltaTime))
  }

  /**
   * 处理碰撞响应
   */
  function handleCollision(ball: Ball, normal: Vector2, penetration: number): void {
    // 移出碰撞位置
    const correction = VectorUtils.multiply(normal, penetration)
    ball.position = VectorUtils.add(ball.position, correction)

    // 计算反弹速度
    const reflectedVelocity = VectorUtils.reflect(ball.velocity, normal)
    ball.velocity = VectorUtils.multiply(reflectedVelocity, config.bounce)

    // 应用摩擦力
    ball.velocity = VectorUtils.multiply(ball.velocity, config.friction)
  }

  /**
   * 物理步进更新
   */
  function physicsStep(ball: Ball, hexagonVertices: Vector2[], deltaTime: number): void {
    // 应用重力
    applyGravity(ball, deltaTime)

    // 应用空气阻力
    applyAirResistance(ball)

    // 更新位置
    updatePosition(ball, deltaTime)

    // 检测碰撞
    const collision = checkHexagonCollision(ball, hexagonVertices)
    if (collision.collision && collision.normal && collision.penetration) {
      handleCollision(ball, collision.normal, collision.penetration)
    }
  }

  return {
    config,
    physicsStep,
    getHexagonVertices,
    VectorUtils
  }
}
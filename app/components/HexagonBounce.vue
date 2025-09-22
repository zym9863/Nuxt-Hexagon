<template>
  <div class="hexagon-container">
    <canvas
      ref="canvasRef"
      :width="canvasSize"
      :height="canvasSize"
      class="hexagon-canvas"
    />
    <div class="controls">
      <div class="control-group">
        <label>重力: {{ physics.config.gravity.toFixed(2) }}</label>
        <input
          v-model.number="physics.config.gravity"
          type="range"
          min="0"
          max="2"
          step="0.1"
        />
      </div>
      <div class="control-group">
        <label>弹性: {{ physics.config.bounce.toFixed(2) }}</label>
        <input
          v-model.number="physics.config.bounce"
          type="range"
          min="0"
          max="1"
          step="0.05"
        />
      </div>
      <div class="control-group">
        <label>摩擦: {{ physics.config.friction.toFixed(2) }}</label>
        <input
          v-model.number="physics.config.friction"
          type="range"
          min="0.8"
          max="1"
          step="0.01"
        />
      </div>
      <div class="control-group">
        <label>旋转速度: {{ rotationSpeed.toFixed(3) }}</label>
        <input
          v-model.number="rotationSpeed"
          type="range"
          min="0"
          max="0.05"
          step="0.001"
        />
      </div>
      <button @click="resetBall" class="reset-btn">重置小球</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePhysics, type Ball, type Vector2 } from '~/composables/usePhysics'

// Canvas 配置
const canvasSize = 600
const hexagonRadius = 250
const ballRadius = 15

// 组件引用
const canvasRef = ref<HTMLCanvasElement>()

// 物理引擎
const physics = usePhysics()

// 动画控制
const animationId = ref<number>()
const lastTime = ref(0)
const rotationSpeed = ref(0.02)
const hexagonRotation = ref(0)

// 球的状态
const ball = ref<Ball>({
  position: { x: canvasSize / 2, y: canvasSize / 2 - 100 },
  velocity: { x: 2, y: 0 },
  radius: ballRadius,
  mass: 1
})

/**
 * 重置球的位置和速度
 */
function resetBall(): void {
  ball.value.position = { x: canvasSize / 2, y: canvasSize / 2 - 100 }
  ball.value.velocity = { x: Math.random() * 4 - 2, y: Math.random() * 2 }
}

/**
 * 绘制六边形
 */
function drawHexagon(ctx: CanvasRenderingContext2D, vertices: Vector2[]): void {
  ctx.strokeStyle = '#4a90e2'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // 绘制六边形边框
  ctx.beginPath()
  ctx.moveTo(vertices[0].x, vertices[0].y)
  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y)
  }
  ctx.closePath()
  ctx.stroke()

  // 绘制六边形填充（半透明）
  const gradient = ctx.createRadialGradient(
    canvasSize / 2, canvasSize / 2, 0,
    canvasSize / 2, canvasSize / 2, hexagonRadius
  )
  gradient.addColorStop(0, 'rgba(74, 144, 226, 0.1)')
  gradient.addColorStop(1, 'rgba(74, 144, 226, 0.05)')

  ctx.fillStyle = gradient
  ctx.fill()

  // 绘制顶点
  ctx.fillStyle = '#e74c3c'
  for (const vertex of vertices) {
    ctx.beginPath()
    ctx.arc(vertex.x, vertex.y, 6, 0, Math.PI * 2)
    ctx.fill()
  }
}

/**
 * 绘制小球
 */
function drawBall(ctx: CanvasRenderingContext2D, ballData: Ball): void {
  const { position, radius } = ballData

  // 球的阴影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  // 球的渐变
  const gradient = ctx.createRadialGradient(
    position.x - radius * 0.3, position.y - radius * 0.3, 0,
    position.x, position.y, radius
  )
  gradient.addColorStop(0, '#ff6b6b')
  gradient.addColorStop(0.7, '#e74c3c')
  gradient.addColorStop(1, '#c0392b')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
  ctx.fill()

  // 重置阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // 球的高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.beginPath()
  ctx.arc(position.x - radius * 0.3, position.y - radius * 0.3, radius * 0.3, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * 绘制速度向量（调试用）
 */
function drawVelocityVector(ctx: CanvasRenderingContext2D, ballData: Ball): void {
  const { position, velocity } = ballData
  const scale = 10

  ctx.strokeStyle = '#f39c12'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(position.x, position.y)
  ctx.lineTo(position.x + velocity.x * scale, position.y + velocity.y * scale)
  ctx.stroke()

  // 箭头头部
  const angle = Math.atan2(velocity.y, velocity.x)
  const headlen = 8
  ctx.beginPath()
  ctx.moveTo(position.x + velocity.x * scale, position.y + velocity.y * scale)
  ctx.lineTo(
    position.x + velocity.x * scale - headlen * Math.cos(angle - Math.PI / 6),
    position.y + velocity.y * scale - headlen * Math.sin(angle - Math.PI / 6)
  )
  ctx.moveTo(position.x + velocity.x * scale, position.y + velocity.y * scale)
  ctx.lineTo(
    position.x + velocity.x * scale - headlen * Math.cos(angle + Math.PI / 6),
    position.y + velocity.y * scale - headlen * Math.sin(angle + Math.PI / 6)
  )
  ctx.stroke()
}

/**
 * 渲染函数
 */
function render(currentTime: number): void {
  const deltaTime = currentTime - lastTime.value
  lastTime.value = currentTime

  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.clearRect(0, 0, canvasSize, canvasSize)

  // 设置背景
  const bgGradient = ctx.createRadialGradient(
    canvasSize / 2, canvasSize / 2, 0,
    canvasSize / 2, canvasSize / 2, canvasSize / 2
  )
  bgGradient.addColorStop(0, '#2c3e50')
  bgGradient.addColorStop(1, '#34495e')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  // 更新六边形旋转
  hexagonRotation.value += rotationSpeed.value

  // 获取六边形顶点
  const vertices = physics.getHexagonVertices(
    canvasSize / 2,
    canvasSize / 2,
    hexagonRadius,
    hexagonRotation.value
  )

  // 物理更新
  physics.physicsStep(ball.value, vertices, deltaTime * 0.016)

  // 绘制六边形
  drawHexagon(ctx, vertices)

  // 绘制小球
  drawBall(ctx, ball.value)

  // 绘制速度向量（可选）
  drawVelocityVector(ctx, ball.value)

  // 继续动画
  animationId.value = requestAnimationFrame(render)
}

/**
 * 启动动画
 */
function startAnimation(): void {
  lastTime.value = performance.now()
  animationId.value = requestAnimationFrame(render)
}

/**
 * 停止动画
 */
function stopAnimation(): void {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = undefined
  }
}

// 生命周期
onMounted(() => {
  startAnimation()
})

onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.hexagon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.hexagon-canvas {
  border: 2px solid #34495e;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: #2c3e50;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}

.control-group label {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.control-group input[type="range"] {
  width: 120px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.control-group input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.reset-btn {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.reset-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
}

.reset-btn:active {
  transform: translateY(0);
}
</style>
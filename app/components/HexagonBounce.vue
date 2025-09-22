<template>
  <div class="hexagon-container">
    <div class="header">
      <h1 class="title">六边形物理演示</h1>
      <p class="subtitle">交互式物理引擎 · 重力与碰撞模拟</p>
    </div>
    <canvas
      ref="canvasRef"
      :width="canvasSize"
      :height="canvasSize"
      class="hexagon-canvas"
    />
    <div class="controls">
      <div class="control-group">
        <label>重力</label>
        <div class="value-display">{{ physics.config.gravity.toFixed(2) }}</div>
        <input
          v-model.number="physics.config.gravity"
          type="range"
          min="0"
          max="2"
          step="0.1"
        />
      </div>
      <div class="control-group">
        <label>弹性</label>
        <div class="value-display">{{ physics.config.bounce.toFixed(2) }}</div>
        <input
          v-model.number="physics.config.bounce"
          type="range"
          min="0"
          max="1"
          step="0.05"
        />
      </div>
      <div class="control-group">
        <label>摩擦</label>
        <div class="value-display">{{ physics.config.friction.toFixed(2) }}</div>
        <input
          v-model.number="physics.config.friction"
          type="range"
          min="0.8"
          max="1"
          step="0.01"
        />
      </div>
      <div class="control-group">
        <label>旋转速度</label>
        <div class="value-display">{{ rotationSpeed.toFixed(3) }}</div>
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
  // 绘制六边形填充（半透明）
  const gradient = ctx.createRadialGradient(
    canvasSize / 2, canvasSize / 2, 0,
    canvasSize / 2, canvasSize / 2, hexagonRadius
  )
  gradient.addColorStop(0, 'rgba(79, 70, 229, 0.15)')
  gradient.addColorStop(0.7, 'rgba(124, 58, 237, 0.1)')
  gradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(vertices[0].x, vertices[0].y)
  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y)
  }
  ctx.closePath()
  ctx.fill()

  // 绘制六边形边框发光效果
  ctx.strokeStyle = '#4f46e5'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = '#4f46e5'
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  ctx.beginPath()
  ctx.moveTo(vertices[0].x, vertices[0].y)
  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y)
  }
  ctx.closePath()
  ctx.stroke()

  // 重置阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  // 绘制顶点
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i]
    
    // 顶点发光效果
    ctx.shadowColor = '#ec4899'
    ctx.shadowBlur = 8
    
    // 外圈
    ctx.fillStyle = '#ec4899'
    ctx.beginPath()
    ctx.arc(vertex.x, vertex.y, 8, 0, Math.PI * 2)
    ctx.fill()
    
    // 内圈
    ctx.shadowBlur = 0
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(vertex.x, vertex.y, 4, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // 重置阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
}

/**
 * 绘制小球
 */
function drawBall(ctx: CanvasRenderingContext2D, ballData: Ball): void {
  const { position, radius } = ballData

  // 球的外发光效果
  ctx.shadowColor = '#fbbf24'
  ctx.shadowBlur = 20
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // 球的渐变 - 更动态的颜色
  const gradient = ctx.createRadialGradient(
    position.x - radius * 0.3, position.y - radius * 0.3, 0,
    position.x, position.y, radius
  )
  gradient.addColorStop(0, '#fbbf24')
  gradient.addColorStop(0.3, '#f59e0b')
  gradient.addColorStop(0.7, '#d97706')
  gradient.addColorStop(1, '#92400e')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
  ctx.fill()

  // 重置阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  // 球的主要高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.beginPath()
  ctx.arc(position.x - radius * 0.4, position.y - radius * 0.4, radius * 0.25, 0, Math.PI * 2)
  ctx.fill()

  // 次要高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.beginPath()
  ctx.arc(position.x + radius * 0.2, position.y - radius * 0.1, radius * 0.1, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * 绘制速度向量（调试用）
 */
function drawVelocityVector(ctx: CanvasRenderingContext2D, ballData: Ball): void {
  const { position, velocity } = ballData
  const scale = 15

  // 向量发光效果
  ctx.shadowColor = '#10b981'
  ctx.shadowBlur = 8
  
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(position.x, position.y)
  ctx.lineTo(position.x + velocity.x * scale, position.y + velocity.y * scale)
  ctx.stroke()

  // 箭头头部
  const angle = Math.atan2(velocity.y, velocity.x)
  const headlen = 12
  
  ctx.lineWidth = 2
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
  
  // 重置阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
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
  bgGradient.addColorStop(0, '#1a1a2e')
  bgGradient.addColorStop(0.5, '#16213e')
  bgGradient.addColorStop(1, '#0f172a')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  // 添加星星效果
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  for (let i = 0; i < 50; i++) {
    const x = (i * 137.5) % canvasSize
    const y = (i * 73.2) % canvasSize
    const size = Math.sin(currentTime * 0.001 + i) * 0.5 + 1
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

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
  gap: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.hexagon-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 90% 90%, rgba(79, 70, 229, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.header {
  text-align: center;
  z-index: 1;
  position: relative;
}

.title {
  margin: 0 0 8px 0;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.5px;
}

.hexagon-canvas {
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: #1a1a2e;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hexagon-canvas:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
  align-items: start;
  background: rgba(255, 255, 255, 0.08);
  padding: 24px;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  max-width: 800px;
  width: 100%;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.control-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.control-group:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.control-group:hover::before {
  opacity: 1;
}

.control-group label {
  color: #f8fafc;
  font-size: 13px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.control-group .value-display {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 60px;
  text-align: center;
}

.control-group input[type="range"] {
  width: 100%;
  max-width: 140px;
  height: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.control-group input[type="range"]:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-group input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(79, 70, 229, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.control-group input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 
    0 6px 16px rgba(79, 70, 229, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.control-group input[type="range"]::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 4px 12px rgba(79, 70, 229, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.control-group input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 
    0 6px 16px rgba(79, 70, 229, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.reset-btn {
  grid-column: 1 / -1;
  padding: 14px 28px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(239, 68, 68, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.reset-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.reset-btn:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(239, 68, 68, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.reset-btn:hover::before {
  left: 100%;
}

.reset-btn:active {
  transform: translateY(0);
  box-shadow: 
    0 2px 8px rgba(239, 68, 68, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .hexagon-container {
    padding: 16px;
    gap: 20px;
  }
  
  .header {
    margin-bottom: -10px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
  
  .controls {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    padding: 20px;
  }
  
  .control-group {
    padding: 12px;
  }
  
  .reset-btn {
    padding: 12px 24px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .hexagon-container {
    gap: 16px;
  }
  
  .title {
    font-size: 1.3rem;
  }
  
  .subtitle {
    font-size: 0.8rem;
  }
  
  .controls {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px;
  }
  
  .control-group {
    padding: 10px;
  }
  
  .control-group label {
    font-size: 11px;
  }
  
  .value-display {
    font-size: 14px;
    padding: 3px 8px;
  }
}
</style>
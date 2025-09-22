[中文](README.md) | [English](README-EN.md)

# Nuxt Hexagon Playground

## 项目简介

基于 Nuxt 4 和 Vue 3 开发的交互式物理演示，展示一个在旋转六边形内部运动并实时响应碰撞的粒子。通过 Canvas 渲染和自定义物理引擎，实现重力、弹性、摩擦以及六边形旋转等效果，适合作为物理仿真或前端动效的示例项目。

## 功能亮点

- 物理参数可视化调节（重力、弹性、摩擦、旋转速度）
- 自定义 `usePhysics` composable 管理碰撞检测与运动学计算
- 高性能 Canvas 渲染，支持渐变填充、顶点高亮和动画平滑过渡
- 采用 Nuxt 4 单文件入口，便于集成到现有项目或扩展更多页面

## 快速开始

推荐使用 pnpm：

```bash
pnpm install
pnpm dev
```

项目同步支持 npm / yarn / bun，仅需替换相应命令即可。

## 可用脚本

| 脚本 | 说明 |
| --- | --- |
| `pnpm dev` | 本地开发模式，默认地址 `http://localhost:3000` |
| `pnpm build` | 生成生产环境构建产物 |
| `pnpm preview` | 预览生产构建 |
| `pnpm generate` | 生成静态站点版本 |

## 主要目录

- `app/app.vue`：应用入口，挂载 `HexagonBounce` 组件
- `app/components/HexagonBounce.vue`：核心 Canvas 场景与控制面板
- `app/composables/usePhysics.ts`：物理引擎逻辑、向量运算与碰撞检测
- `app/assets/css/main.css`：全局样式与背景渐变
- `public/`：静态资源（favicon、robots 等）

## 控制面板参数

- `重力`：影响下落加速度，范围 `0 ~ 2`
- `弹性`：碰撞后的能量保留比，范围 `0 ~ 1`
- `摩擦`：碰撞后速度衰减比，范围 `0.8 ~ 1`
- `旋转速度`：六边形旋转角速度，范围 `0 ~ 0.05`
- `重置小球`：随机初始化小球速度并保持初始位置

## 技术栈

- Nuxt 4 / Vue 3 / TypeScript
- Canvas 2D 渲染
- 组合式 API 与响应式状态管理

## 部署

生产部署示例：

```bash
pnpm install
pnpm build
pnpm preview # 或将 .output 目录部署至自选平台
```

如需自定义部署流程，可查阅 [Nuxt 官方部署文档](https://nuxt.com/docs/getting-started/deployment)。

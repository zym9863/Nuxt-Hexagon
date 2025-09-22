[中文](README.md) | [English](README-EN.md)

# Nuxt Hexagon Playground

## Project Overview

An interactive physics demo built with Nuxt 4 and Vue 3, showcasing a particle moving inside a rotating hexagon with real-time collision response. Canvas rendering and a custom physics engine power gravity, elasticity, friction, and rotation effects, making it a handy reference for physics simulations or frontend motion design.

## Key Features

- Visual controls for gravity, elasticity, friction, and rotation speed
- Custom `usePhysics` composable for collision detection and kinematics
- High-performance Canvas rendering with gradient fills, vertex highlights, and smooth animation
- Nuxt 4 single-entry setup that is easy to embed into existing projects or extend with extra pages

## Quick Start

`pnpm` is recommended.

```bash
pnpm install
pnpm dev
```

The project also works with npm, yarn, or bun; just swap in the equivalent commands.

## Available Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Run the local dev server at `http://localhost:3000` |
| `pnpm build` | Produce a production build |
| `pnpm preview` | Preview the production build |
| `pnpm generate` | Export a static-site build |

## Main Directories

- `app/app.vue`: Application entry that mounts the `HexagonBounce` component
- `app/components/HexagonBounce.vue`: Core Canvas scene and control panel
- `app/composables/usePhysics.ts`: Physics engine logic, vector math, and collision detection
- `app/assets/css/main.css`: Global styles and gradient background
- `public/`: Static assets such as favicon and robots.txt

## Control Panel Parameters

- `Gravity`: Controls downward acceleration; range `0 ~ 2`
- `Elasticity`: Ratio of energy preserved after collision; range `0 ~ 1`
- `Friction`: Velocity decay after collision; range `0.8 ~ 1`
- `Rotation Speed`: Hexagon angular velocity; range `0 ~ 0.05`
- `Reset Ball`: Randomize the ball velocity while keeping the starting position

## Tech Stack

- Nuxt 4 / Vue 3 / TypeScript
- Canvas 2D rendering
- Composition API with reactive state management

## Deployment

Example production workflow:

```bash
pnpm install
pnpm build
pnpm preview # or deploy the .output directory to your preferred platform
```

For custom setups, see the [Nuxt deployment guide](https://nuxt.com/docs/getting-started/deployment).


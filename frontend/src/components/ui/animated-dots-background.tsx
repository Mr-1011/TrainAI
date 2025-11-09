import { useEffect, useRef } from 'react'

interface DotState {
  currentOpacity: number
  currentRadius: number
  targetOpacity: number
  targetRadius: number
}

export const AnimatedDotsBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let mouseX = -1000
    let mouseY = -1000

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)

    const gridSize = 20
    const dotRadius = 0.8
    const maxDistance = 100
    const baseOpacity = 0.08

    const dotStates = new Map<string, DotState>()

    const animate = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cols = Math.ceil(canvas.width / gridSize)
      const rows = Math.ceil(canvas.height / gridSize)

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize
          const y = j * gridSize
          const key = `${i}-${j}`

          const dx = mouseX - x
          const dy = mouseY - y
          const distance = Math.sqrt(dx * dx + dy * dy)

          let targetOpacity = baseOpacity
          let targetRadius = dotRadius

          if (distance < maxDistance) {
            const influence = 1 - distance / maxDistance
            const smoothInfluence = influence * influence
            targetOpacity = baseOpacity + smoothInfluence * 0.35
            targetRadius = dotRadius + smoothInfluence * 1.5
          }

          if (!dotStates.has(key)) {
            dotStates.set(key, {
              currentOpacity: baseOpacity,
              currentRadius: dotRadius,
              targetOpacity: baseOpacity,
              targetRadius: dotRadius
            })
          }

          const state = dotStates.get(key)!
          state.targetOpacity = targetOpacity
          state.targetRadius = targetRadius

          state.currentOpacity += (state.targetOpacity - state.currentOpacity) * 0.05
          state.currentRadius += (state.targetRadius - state.currentRadius) * 0.05

          ctx.beginPath()
          ctx.arc(x, y, state.currentRadius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 0, 0, ${state.currentOpacity})`
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  )
}

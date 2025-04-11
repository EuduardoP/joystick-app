"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Position {
  x: number
  y: number
}

interface JoystickProps {
  label?: string
  onDirectionChange: (x: number, y: number) => void
  horizontal?: boolean
  vertical?: boolean
  size?: number
  id: string // Unique identifier for each joystick
}

export function Joystick({
  label,
  onDirectionChange,
  horizontal = true,
  vertical = true,
  size = 150,
  id,
}: JoystickProps) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [active, setActive] = useState(false)
  const [touchId, setTouchId] = useState<number | null>(null)
  const joystickRef = useRef<HTMLDivElement>(null)
  const baseSize = size
  const knobSize = size * 0.4
  const maxDistance = (baseSize - knobSize) / 2

  // Calculate direction values (for sending to the car)
  const directionX = Math.round((position.x / maxDistance) * 100)
  const directionY = Math.round((-position.y / maxDistance) * 100)

  // Send direction values to parent component
  useEffect(() => {
    onDirectionChange(directionX, directionY)
  }, [directionX, directionY, onDirectionChange])

  const updateJoystickPosition = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let deltaX = horizontal ? clientX - centerX : 0
    let deltaY = vertical ? clientY - centerY : 0

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // If distance is greater than max, normalize
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance
      deltaY = (deltaY / distance) * maxDistance
    }

    setPosition({ x: deltaX, y: deltaY })
  }

  const resetJoystick = () => {
    setActive(false)
    setTouchId(null)
    setPosition({ x: 0, y: 0 })
  }

  // Touch event handlers for mobile
  useEffect(() => {
    const joystickElement = joystickRef.current
    if (!joystickElement) return

    const handleTouchStart = (e: TouchEvent) => {
      // If this joystick is already active with another touch, ignore
      if (active && touchId !== null) return

      // Find a touch that started on this joystick
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const rect = joystickElement.getBoundingClientRect()

        // Check if touch is within this joystick
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          e.preventDefault()
          setActive(true)
          setTouchId(touch.identifier)
          updateJoystickPosition(touch.clientX, touch.clientY)
          break
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      // If not active or no touch ID, ignore
      if (!active || touchId === null) return

      // Find the touch that matches our stored ID
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        if (touch.identifier === touchId) {
          e.preventDefault()
          updateJoystickPosition(touch.clientX, touch.clientY)
          break
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      // If not active or no touch ID, ignore
      if (!active || touchId === null) return

      // Find the touch that matches our stored ID
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        if (touch.identifier === touchId) {
          e.preventDefault()
          resetJoystick()
          break
        }
      }
    }

    // Add event listeners to the document
    document.addEventListener("touchstart", handleTouchStart, { passive: false })
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd, { passive: false })
    document.addEventListener("touchcancel", handleTouchEnd, { passive: false })

    return () => {
      // Remove event listeners
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [active, touchId, horizontal, vertical])

  // Mouse event handlers for desktop
  useEffect(() => {
    const joystickElement = joystickRef.current
    if (!joystickElement) return

    const handleMouseDown = (e: MouseEvent) => {
      // Only handle mouse events if no touch is active
      if (touchId !== null) return

      const rect = joystickElement.getBoundingClientRect()

      // Check if click is within this joystick
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        setActive(true)
        updateJoystickPosition(e.clientX, e.clientY)

        // Store which joystick is active in a data attribute on the document
        document.documentElement.setAttribute(`data-active-joystick`, id)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Only process if this is the active joystick
      if (active && document.documentElement.getAttribute(`data-active-joystick`) === id) {
        updateJoystickPosition(e.clientX, e.clientY)
      }
    }

    const handleMouseUp = () => {
      // Only reset if this is the active joystick
      if (active && document.documentElement.getAttribute(`data-active-joystick`) === id) {
        resetJoystick()
        document.documentElement.removeAttribute(`data-active-joystick`)
      }
    }

    // Add mouse event listeners
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      // Remove mouse event listeners
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [active, id, horizontal, vertical, touchId])

  return (
    <div
      ref={joystickRef}
      className="relative bg-gray-800 rounded-full border-4 border-gray-700 shadow-inner cursor-pointer touch-none"
      style={{ width: baseSize, height: baseSize }}
      data-joystick-id={id}
    >
      {/* Direction indicators */}
      {horizontal && (
        <>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">◀</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▶</div>
        </>
      )}
      {vertical && (
        <>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs">▲</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs">▼</div>
        </>
      )}

      {/* Joystick knob */}
      <div
        className={cn(
          "absolute bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-lg transition-transform duration-75",
          active ? "from-blue-400 to-blue-600" : "",
        )}
        style={{
          width: knobSize,
          height: knobSize,
          left: `calc(50% - ${knobSize / 2}px)`,
          top: `calc(50% - ${knobSize / 2}px)`,
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
    </div>
  )
}

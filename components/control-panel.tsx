"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, Lightbulb, Zap, RotateCcw, Gauge } from "lucide-react"
import { ControlsData } from "@/app/api/controls/route"

interface ControlPanelProps {
  speed: number
  onSpeedChange: (value: number) => void
  connected: boolean
  lightsOn?: boolean
  hornActive?: boolean 
  flipActive?: boolean
  turboActive?: boolean
  onLightsToggle?: (state: boolean) => void
  onHornToggle?: (state: boolean) => void
  onFlipToggle?: (state: boolean) => void
  onTurboToggle?: (state: boolean) => void
}

export function ControlPanel({ 
  speed, 
  onSpeedChange, 
  connected,
  lightsOn: externalLightsOn,
  hornActive: externalHornActive,
  flipActive: externalFlipActive,
  turboActive: externalTurboActive,
  onLightsToggle,
  onHornToggle,
  onFlipToggle,
  onTurboToggle
}: ControlPanelProps) {
  // Use external state if provided, otherwise use internal state
  const [lightsOnInternal, setLightsOnInternal] = useState(false)
  const [hornActiveInternal, setHornActiveInternal] = useState(false)
  const [turboActiveInternal, setTurboActiveInternal] = useState(false)
  const [flipActiveInternal, setFlipActiveInternal] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const lightsOn = externalLightsOn !== undefined ? externalLightsOn : lightsOnInternal
  const hornActive = externalHornActive !== undefined ? externalHornActive : hornActiveInternal
  const flipActive = externalFlipActive !== undefined ? externalFlipActive : flipActiveInternal
  const turboActive = externalTurboActive !== undefined ? externalTurboActive : turboActiveInternal
  
  // State setters that call callbacks if provided
  const setLightsOn = (state: boolean) => {
    if (onLightsToggle) {
      onLightsToggle(state)
    } else {
      setLightsOnInternal(state)
    }
  }
  
  const setHornActive = (state: boolean) => {
    if (onHornToggle) {
      onHornToggle(state)
    } else {
      setHornActiveInternal(state)
    }
  }
  
  const setFlipActive = (state: boolean) => {
    if (onFlipToggle) {
      onFlipToggle(state)
    } else {
      setFlipActiveInternal(state)
    }
  }
  
  const setTurboActive = (state: boolean) => {
    if (onTurboToggle) {
      onTurboToggle(state)
    } else {
      setTurboActiveInternal(state)
    }
  }
  
  // Send controls data to API
  const sendControlsData = async (controlsData: Partial<ControlsData>) => {
    if (!connected) return;
    
    try {
      const response = await fetch('/api/controls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rotation: 0, // Default values - these would normally come from joystick
          movement: 0,
          speed,
          lights: lightsOn,
          horn: hornActive,
          flip: flipActive,
          turbo: turboActive,
          ...controlsData // Override with any provided values
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to send controls data');
      }
    } catch (error) {
      console.error('Error sending controls data:', error);
    }
  };

  const handleHorn = () => {
    setHornActive(true)
    sendControlsData({ horn: true })
    setTimeout(() => {
      setHornActive(false)
      sendControlsData({ horn: false })
    }, 500)
  }

  const handleLights = () => {
    const newLightsState = !lightsOn
    setLightsOn(newLightsState)
    sendControlsData({ lights: newLightsState })
  }
  
  const handleFlip = () => {
    setFlipActive(true)
    sendControlsData({ flip: true })
    setTimeout(() => {
      setFlipActive(false)
      sendControlsData({ flip: false })
    }, 100)
  }

  const handleTurbo = () => {
    const newTurboState = !turboActive
    setTurboActive(newTurboState)
    sendControlsData({ turbo: newTurboState })
  }

  return (
    <div className="p-4 bg-gray-800 rounded-t-xl shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-gray-400" />
            <span className="text-sm">Max Speed</span>
          </div>
          <span className="text-sm font-bold">{speed}%</span>
        </div>
        <Slider
          value={[speed]}
          min={0}
          max={100}
          step={1}
          disabled={!connected}
          onValueChange={(value) => onSpeedChange(value[0])}
          className="my-4"
        />
      </div>

      <div className="grid grid-cols-4 gap-2 mb-2">
        <Button
          variant="secondary"
          size="icon"
          className={`h-16 ${lightsOn ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
          onClick={handleLights}
          disabled={!connected}
        >
          <Lightbulb />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="h-16"
          onPointerDown={handleHorn}
          onPointerUp={() => setHornActive(false)}
          disabled={!connected}
        >
          <Volume2 className={`h-6 w-6 ${hornActive ? "text-blue-400" : ""}`} />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className={`h-16 ${flipActive ? "bg-green-600 hover:bg-green-700" : ""}`}
          onClick={handleFlip}
          disabled={!connected}
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          className={`h-16 ${turboActive ? "bg-red-600 hover:bg-red-700" : ""}`}
          onClick={handleTurbo}
          disabled={!connected}
        >
          <Zap className={`h-6 w-6 ${turboActive ? "text-yellow-300" : ""}`} />
        </Button>
      </div>
    </div>
  )
}

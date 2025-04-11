"use client"

import { useState, useEffect } from "react"
import { Joystick } from "@/components/joystick"
import { ControlPanel } from "@/components/control-panel"
import { ConnectionStatus } from "@/components/connection-status"
import { Settings } from "@/components/settings"
import { Cog, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ControlsData } from "./api/controls/route"

export default function RCCarController() {
  const [connected, setConnected] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [showSettings, setShowSettings] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState(85)

  // Control values from joysticks
  const [rotationValue, setRotationValue] = useState(0)
  const [movementValue, setMovementValue] = useState(0)
  
  // Control button states
  const [lightsOn, setLightsOn] = useState(false)
  const [hornActive, setHornActive] = useState(false)
  const [flipActive, setFlipActive] = useState(false)
  const [turboActive, setTurboActive] = useState(false)

  // Simulate connection status
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnected(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Simulate battery drain
  useEffect(() => {
    if (connected) {
      const interval = setInterval(() => {
        setBatteryLevel((prev) => Math.max(prev - 1, 0))
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [connected])

  // Send controls data to API
  const sendControlsData = async (controlsData: ControlsData) => {
    if (!connected) return;
    
    try {
      const response = await fetch('/api/controls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(controlsData),
      });
      
      if (!response.ok) {
        console.error('Failed to send controls data');
      }
    } catch (error) {
      console.error('Error sending controls data:', error);
    }
  };

  // Function to handle joystick input
  const handleRotationChange = (x: number, y: number) => {
    setRotationValue(x)
    sendControlsData({
      rotation: x,
      movement: movementValue,
      speed,
      lights: lightsOn,
      horn: hornActive,
      flip: flipActive,
      turbo: turboActive
    });
  }

  const handleMovementChange = (x: number, y: number) => {
    setMovementValue(y)
    sendControlsData({
      rotation: rotationValue,
      movement: y,
      speed,
      lights: lightsOn,
      horn: hornActive,
      flip: flipActive,
      turbo: turboActive
    });
  }

  // Handle speed change
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    sendControlsData({
      rotation: rotationValue,
      movement: movementValue,
      speed: newSpeed,
      lights: lightsOn,
      horn: hornActive,
      flip: flipActive,
      turbo: turboActive
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-4 flex justify-between items-center">
          <ConnectionStatus connected={connected} batteryLevel={batteryLevel} />
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? <X className="h-6 w-6" /> : <Cog className="h-6 w-6" />}
          </Button>
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {showSettings ? (
            <Settings onClose={() => setShowSettings(false)} />
          ) : (
            <>
              <div className="flex-1 flex items-center justify-between px-4">
                <div className="flex flex-col items-center">
                  <Joystick
                    id="rotation-joystick"
                    label="Rotation"
                    onDirectionChange={handleRotationChange}
                    vertical={false}
                    horizontal={true}
                    size={140}
                  />
                  <div className="mt-2 text-sm text-center">
                    <p className="text-gray-400">Rotação</p>
                    <p>{rotationValue > 0 ? "Direita" : rotationValue < 0 ? "Esquerda" : "Parado"}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <Joystick
                    id="movement-joystick"
                    label="Movement"
                    onDirectionChange={handleMovementChange}
                    horizontal={false}
                    vertical={true}
                    size={140}
                  />
                  <div className="mt-2 text-sm text-center">
                    <p className="text-gray-400">Movement</p>
                    <p>{movementValue < 0 ? "Para tras" : movementValue > 0 ? "Para frente" : "Parado"}</p>
                  </div>
                </div>
              </div>
              <ControlPanel 
                speed={speed} 
                onSpeedChange={handleSpeedChange} 
                connected={connected}
                lightsOn={lightsOn}
                hornActive={hornActive}
                flipActive={flipActive}
                turboActive={turboActive}
                onLightsToggle={(state) => {
                  setLightsOn(state);
                  sendControlsData({
                    rotation: rotationValue,
                    movement: movementValue,
                    speed,
                    lights: state,
                    horn: hornActive,
                    flip: flipActive,
                    turbo: turboActive
                  });
                }}
                onHornToggle={(state) => {
                  setHornActive(state);
                  sendControlsData({
                    rotation: rotationValue,
                    movement: movementValue,
                    speed,
                    lights: lightsOn,
                    horn: state,
                    flip: flipActive,
                    turbo: turboActive
                  });
                }}
                onFlipToggle={(state) => {
                  setFlipActive(state);
                  sendControlsData({
                    rotation: rotationValue,
                    movement: movementValue,
                    speed,
                    lights: lightsOn,
                    horn: hornActive,
                    flip: state,
                    turbo: turboActive
                  });
                }}
                onTurboToggle={(state) => {
                  setTurboActive(state);
                  sendControlsData({
                    rotation: rotationValue,
                    movement: movementValue,
                    speed,
                    lights: lightsOn,
                    horn: hornActive,
                    flip: flipActive,
                    turbo: state
                  });
                }}
              />
            </>
          )}
        </div>
      </div>
    </main>
  )
}

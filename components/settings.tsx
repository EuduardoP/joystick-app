"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Wifi, Save, RotateCw } from "lucide-react"

interface SettingsProps {
  onClose: () => void
}

// Interface for our settings
interface ControllerSettings {
  deviceName: string;
  invertControls: boolean;
  sensitivity: number;
  deadzone: number;
  vibration: boolean;
  ipAddress: string;
  port: string;
}

// Default settings
const defaultSettings: ControllerSettings = {
  deviceName: "RC-Car-2023",
  invertControls: false,
  sensitivity: 75,
  deadzone: 10,
  vibration: true,
  ipAddress: "192.168.4.1",
  port: "80"
}

export function Settings({ onClose }: SettingsProps) {
  const [deviceName, setDeviceName] = useState(defaultSettings.deviceName)
  const [invertControls, setInvertControls] = useState(defaultSettings.invertControls)
  const [sensitivity, setSensitivity] = useState(defaultSettings.sensitivity)
  const [deadzone, setDeadzone] = useState(defaultSettings.deadzone)
  const [vibration, setVibration] = useState(defaultSettings.vibration)
  const [ipAddress, setIpAddress] = useState(defaultSettings.ipAddress)
  const [port, setPort] = useState(defaultSettings.port)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('controllerSettings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as ControllerSettings
        setDeviceName(parsedSettings.deviceName || defaultSettings.deviceName)
        setInvertControls(parsedSettings.invertControls ?? defaultSettings.invertControls)
        setSensitivity(parsedSettings.sensitivity || defaultSettings.sensitivity)
        setDeadzone(parsedSettings.deadzone || defaultSettings.deadzone)
        setVibration(parsedSettings.vibration ?? defaultSettings.vibration)
        setIpAddress(parsedSettings.ipAddress || defaultSettings.ipAddress)
        setPort(parsedSettings.port || defaultSettings.port)
      } catch (error) {
        console.error('Error loading settings from localStorage:', error)
      }
    }
  }, [])

  const handleSave = () => {
    const settings: ControllerSettings = {
      deviceName,
      invertControls,
      sensitivity,
      deadzone,
      vibration,
      ipAddress,
      port
    }

    // Save to localStorage
    localStorage.setItem('controllerSettings', JSON.stringify(settings))
    
    // Also save to cookies for server-side access
    document.cookie = `controllerSettings=${JSON.stringify(settings)}; path=/; max-age=31536000; SameSite=Strict`
    
    // Close settings panel
    onClose()
  }

  const handleCalibrate = () => {
    // Future implementation: Calibrate joystick
    alert('Calibration feature coming soon!')
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-6">Controller Settings</h2>

      <div className="space-y-6 flex-1">
        <div className="flex items-center gap-2 py-3 px-4 bg-blue-500/10 rounded-md">
          <Wifi className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-medium">Wi-Fi Connection Mode</span>
        </div>

        <div className="space-y-3">
          <Label htmlFor="device-name">Device Name</Label>
          <Input id="device-name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
        </div>

        <div className="space-y-3">
          <Label htmlFor="ip-address">IP Address</Label>
          <Input 
            id="ip-address" 
            value={ipAddress} 
            onChange={(e) => setIpAddress(e.target.value)} 
            placeholder="192.168.4.1" 
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="port">Port</Label>
          <Input 
            id="port" 
            value={port} 
            onChange={(e) => setPort(e.target.value)} 
            placeholder="80" 
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="invert-controls">Invert Controls</Label>
            <Switch id="invert-controls" checked={invertControls} onCheckedChange={setInvertControls} />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <Label htmlFor="sensitivity">Joystick Sensitivity</Label>
              <span className="text-sm">{sensitivity}%</span>
            </div>
            <Slider
              id="sensitivity"
              value={[sensitivity]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setSensitivity(value[0])}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <Label htmlFor="deadzone">Joystick Deadzone</Label>
              <span className="text-sm">{deadzone}%</span>
            </div>
            <Slider
              id="deadzone"
              value={[deadzone]}
              min={0}
              max={30}
              step={1}
              onValueChange={(value) => setDeadzone(value[0])}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="vibration">Vibration Feedback</Label>
            <Switch id="vibration" checked={vibration} onCheckedChange={setVibration} />
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleCalibrate}>
          <RotateCw className="h-4 w-4 mr-2" />
          Calibrate Joystick
        </Button>
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}

import { Battery, WifiOff, Wifi } from "lucide-react"

interface ConnectionStatusProps {
  connected: boolean
  batteryLevel: number
}

export function ConnectionStatus({ connected, batteryLevel }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {connected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
        <span className="text-sm font-medium">{connected ? "Connected" : "Disconnecting..."}</span>
      </div>

      <div className="flex items-center gap-1">
        <Battery className={`h-5 w-5 ${batteryLevel < 20 ? "text-red-500" : "text-green-500"}`} />
        <span className="text-sm font-medium">{batteryLevel}%</span>
      </div>
    </div>
  )
}

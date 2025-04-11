import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface ControlsData {
  rotation: number;
  movement: number;
  speed: number;
  lights: boolean;
  horn: boolean;
  flip: boolean;
  turbo: boolean;
}

export interface ControllerSettings {
  deviceName: string;
  invertControls: boolean;
  sensitivity: number;
  deadzone: number;
  vibration: boolean;
  ipAddress: string;
  port: string;
}

// Default settings
const defaultSettings = {
  ipAddress: '192.168.4.1',
  port: '80'
};

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data: ControlsData = await request.json();
    console.log('Controls data received:', data);
    
    // Get settings from cookies (Next.js server-side compatible)
    // Note: In a production app you might want to use a more robust solution
    const settingsCookie = (await cookies()).get('controllerSettings')?.value;
    
    // Parse settings or use defaults
    let ipAddress = defaultSettings.ipAddress;
    let port = defaultSettings.port;
    
    if (settingsCookie) {
      try {
        const settings = JSON.parse(settingsCookie) as ControllerSettings;
        ipAddress = settings.ipAddress || defaultSettings.ipAddress;
        port = settings.port || defaultSettings.port;
      } catch (e) {
        console.error('Error parsing settings cookie:', e);
      }
    }

    // Construct the URL using the settings
    const targetUrl = `http://${ipAddress}:${port}/controls`;
    
    // Send data to the ESP32 via HTTP POST
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        // Set a timeout for the request (3 seconds)
        signal: AbortSignal.timeout(3000)
      });

      if (!response.ok) {
        throw new Error(`ESP32 responded with status ${response.status}`);
      }

      const esp32Response = await response.text(); // or .json() if it returns JSON

      return NextResponse.json({
        success: true,
        message: 'Data sent to ESP32 successfully',
        esp32Response,
        timestamp: new Date().toISOString(),
      });
    } catch (fetchError) {
      console.error(`Error connecting to ESP32 at ${targetUrl}:`, fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error processing controls data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send data to ESP32',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

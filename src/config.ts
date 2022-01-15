import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { z } from 'zod'

const homeDir = app.getPath('home')
const configPath = path.join(homeDir, 'sunset-app.json')

const defaultConfig = {
  // Prague
  latitude: 50.073658,
  longitude: 14.41854,
  default: true,
  configPath
}

const ConfigShape = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})

type ConfigFile = z.input<typeof ConfigShape>
export type AppConfig = ConfigFile & { default: boolean; configPath: string }

export function loadConfig(): AppConfig {
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath).toString())
      return {
        ...ConfigShape.parse(config),
        default: false,
        configPath
      }
    } catch (_) {
      // unable to parse JSON config -> use defaults
      return defaultConfig
    }
  }
  return defaultConfig
}

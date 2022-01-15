import { format, differenceInSeconds, add } from 'date-fns'
import { app, Tray, Menu, dialog, MessageBoxOptions, nativeImage } from 'electron'
import path from 'path'
import { getTimes } from 'suncalc'
import { AppConfig, loadConfig } from './config'

const assetsDirectory = path.join(__dirname, '../assets')

const icons = {
  // suffix "*Template" handles dark/light mode change
  // images have to be black + alpha only
  // @2x retina images are loaded automatically
  sunrise: path.join(assetsDirectory, 'sunriseTemplate.png'),
  sunset: path.join(assetsDirectory, 'sunsetTemplate.png'),

  // For info dialog
  dialog: path.join(assetsDirectory, 'dialog.png')
}

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  const config = loadConfig()

  createTray(config)
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

function formatHours(date: Date) {
  return format(date, 'HH:mm')
}

function getNextEvent(config: AppConfig) {
  const { latitude, longitude } = config
  const now = new Date()
  const times = getTimes(now, latitude, longitude)

  // today's sunset has already happened -> recompute for tomorrow
  if (differenceInSeconds(times.sunset, now) < 0) {
    const tomorrowTimes = getTimes(add(now, { days: 1 }), latitude, longitude)
    return { type: 'sunrise', date: tomorrowTimes.sunrise } as const
  }

  return { type: 'sunset', date: times.sunset } as const
}

function updateTray(tray: Tray, config: AppConfig) {
  const { latitude, longitude } = config
  const { type, date } = getNextEvent(config)
  const title = formatHours(date)
  tray.setTitle(title)
  tray.setImage(icons[type])

  const now = new Date()
  const times = getTimes(now, latitude, longitude)

  const tomorrow = add(now, { days: 1 })
  const tomorrowTimes = getTimes(tomorrow, latitude, longitude)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Today`,
      enabled: false
    },
    {
      label: `${format(now, 'dd.MM.yyyy')}`,
      enabled: false
    },
    {
      label: `↗ ${formatHours(times.sunrise)}     ↘ ${formatHours(times.sunset)}`,
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: `Tomorrow`,
      enabled: false
    },
    {
      label: `${format(tomorrow, 'dd.MM.yyyy')}`,
      enabled: false
    },
    {
      label: `↗ ${formatHours(tomorrowTimes.sunrise)}     ↘ ${formatHours(tomorrowTimes.sunset)}`,
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: 'Info',
      click: () => {
        const msg = config.default
          ? `Unable to load config from ${config.configPath} → using Prague's location as default`
          : `Config ${config.configPath} successfully loaded`
        const options: MessageBoxOptions = {
          icon: nativeImage.createFromPath(icons.dialog),
          message: `SunsetApp\n\n${msg}\n\nLatitude: ${latitude}\nLongitude: ${longitude}`,
          buttons: ['OK']
        }
        // @ts-ignore browserWindow is optional according to docs
        dialog.showMessageBox(null, options)
      }
    },
    {
      label: `Version ${app.getVersion()}`,
      enabled: false
    },
    {
      label: 'Quit',
      role: 'quit',
      click: () => app.quit()
    }
  ])

  tray.setContextMenu(contextMenu)
}

function createTray(config: AppConfig) {
  const tray = new Tray(icons.sunrise)

  updateTray(tray, config)

  // Update tray every minute
  setInterval(() => {
    updateTray(tray, config)
  }, 60_000)
}

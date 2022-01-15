<div align="center">
  <h1>SunsetApp</h1>
  
  A simple tray app for Mac OS showing the current sunrise or sunset for given geolocation.

  <br />
  <img src="./assets/preview.png" />
</div>

## Setup

1.  Create `~/sunset-app.json` file

```
{
  "latitude": 50.073658,
  "longitude": 14.41854
}
```

2.  Run the app

## Notes

This app is built using Electron, which makes it kinda big (over 200 MB) although it's very simple.
That's because I am lazy and I don't want to learn Objective-C and write the sunrise/sunset equation on my own.
If you find a Rust / Go / JavaScript library or framework that can handle system bar changes for MacOS AND the equation for the times, please let me know.

The main target is MacOS since it can display text in the status bar, but the app will probably work on Linux & Windows as well (you have to build it on your own).

## Development

```sh
git clone https://github.com/vojty/sunset-app
cd sunset-app
yarn install
yarn start
```

## Packaging

```sh
yarn package:all # for MacOS
open out/SunsetApp-darwin-arm64/SunsetApp.app # M1
open out/SunsetApp-darwin-x64/SunsetApp.app # Intel

# you can build it for your own target
# https://github.com/electron/electron-packager#supported-platforms
./node_modules/.bin/electron-packager ./ --platform=<platform> --arch=<arch> --out=out --icon=./assets/icon.icns --overwrite
```

## Credits

Sunrise/sunset calculation - https://github.com/mourner/suncalc

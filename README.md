# Usage of this patch tool

* `yarn install`
* `node .`

# Usage of patched project
* `cd headless-rower/`
* `yarn add serialport --build-from-source` (Build *node-serialport* for your platform)
* `yarn add babel-preset-env babel-register`
* `node .`
* A WebSocket is now open on port 8448. If you connect your WaterRower via USB and point your Browser to <https://we-row.mynohrd.com/dashboard>, you can start your workout without the Electron app.
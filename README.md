# werow-headless-extractor

This downloads the linux version of the [We-Row software](https://www.nohrd.com/us/we-row) and extracts the USB-to-WebSocket-Bridge from the Electron app. The bridge is just a simple node package that relies on [node-serialport](https://github.com/node-serialport/node-serialport), [socket.io](https://github.com/socketio/socket.io) and [express](https://github.com/expressjs/express).

You can then go ahead and patch the extracted node packages dependencies (especially *node-serialport*, as it fixes memory-leaks and performance issues) and use the package and the [We-Row website](https://we-row.mynohrd.com/) without the official Electron app.

I wrote this becasue I didn't want to violate any copyright by publishing the extracted node package itself. But I really didn't like the Electron app and it's outdated dependencies.

## Usage

* Clone
* `yarn install`
* `node .`

## Usage of patched project

* `cd werow-headless-rower/`
* `yarn add serialport --build-from-source` (build the most recent *node-serialport* for your platform)
* `yarn add babel-preset-env babel-register` (add Babel transpiler)
* (optional) `yarn add express socket.io` (update other dependencies to the most recent version)
* `node .`

A WebSocket is now open on port 8448. If you connect your WaterRower via USB and point your Browser to <https://we-row.mynohrd.com/>, you can start your workout in your browser and without the Electron app.

### Other use cases

If you comment out the two `writeFileSync`-directives in the `replaceFiles` function and repackage the package with [asar](https://github.com/electron/asar), you can probably patch the Electron app yourself (I didn't try that).

With a bit of tinkering, it would also be possible to make a wireless interface for your WaterRower:

* Get a Rasperry Pi (or similar device)
* Connect it to the WaterRower via USB
* Run the node package on your device
* The We-Row website it looking for the WebSocket on 127.0.0.1:8448, so either:
  * [socat](https://linux.die.net/man/1/socat) (or similar) 127.0.0.1:8448 -> device:8848
  * Get a browser plugin to patch the We-Row website to listen to device:8848 instead of 127.0.0.1:8448

## Troubleshooting

*node-serialport* has C++ dependencies, so reinstalling it is necessary if you're not on linux-x64, as the package we downloaded came with a pre-compiled node-serialport version for that os. You probably still want to upgrade node-serialport though, as they fixed a whole bunch of memory-leaks and performance issues.

If you don't have gcc installed, you might want to try the pre-compiled node-serialport binaries available. Please refere to the node-serialport README for that.

This package does 5 extract actions in a row and makes a bunch of assumptions about filenames and paths. If something goes wrong, it's probably easier to just manually extract everything..

### Known working versions (macOS)

 * `express": "^4.16.3",`
 * `serialport": "^6.2.0",`
 * `socket.io": "^2.1.1"`
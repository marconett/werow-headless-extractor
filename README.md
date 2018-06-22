# werow-headless-extractor

This downloads the linux version of the [We-Row software](https://www.nohrd.com/us/we-row) and extracts the USB-to-WebSocket-Bridge from the Electron app. The bridge is just a simple node package that relies on [node-serialport](https://github.com/node-serialport/node-serialport), [socket.io](https://github.com/socketio/socket.io) and [express](https://github.com/expressjs/express).

It then patches the extracted node package so it is compatible with *node-serialport* >= 5.0.0 (which makes it incompatible with prior versions) and replaces Electron specific code with the Bable transpiler.

You then need to go ahead and update the extracted node packages dependencies (most importantly *node-serialport*) and add the Babel transpiler.

You can now use the USB-to-WebSocket-Bridge and the [We-Row website](https://we-row.mynohrd.com/) without the official Electron app.

I wrote this becasue I didn't want to violate any copyright by publishing the extracted node package itself. I really didn't like the Electron app and it's outdated dependencies, as newer *node-serialport* versions have fixes for a bunch memory-leaks and performance issues.

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
* The We-Row website is looking for the WebSocket on 127.0.0.1:8448, so either:
  * [socat](https://linux.die.net/man/1/socat) (or similar) 127.0.0.1:8448 -> device:8848
  * Get a browser plugin to patch the We-Row website to listen to device:8848 instead of 127.0.0.1:8448

## Troubleshooting

*node-serialport* has C++ dependencies. If you don't have gcc installed, you might want to try the pre-compiled node-serialport binaries available. Please refere to the node-serialport README for that. I had trouble with pre-compiled versions on my macOS system, so I needed to compile from source.

This package does 5 extract actions in a row and makes a bunch of assumptions about filenames and paths. If something goes wrong, it's probably easier to just manually extract and patch everything..

### Known working versions (macOS)

 * `express": "^4.16.3",`
 * `serialport": "^6.2.0",`
 * `socket.io": "^2.1.1"`
#!/bin/bash
#./nwjs-v0.16.1-linux-x64/nw ./wddwallet &
./nwjs-sdk-v0.16.1-linux-x64/nw --enable-logging ./wddwallet &
disown

#!/bin/bash
cd "$(dirname "$BASH_SOURCE")" || {
    echo "Error getting script directory" >&2
    exit 1
}
open -n ./nwjs-v0.16.1-osx-x64/nwjs.app --args "$(dirname "$BASH_SOURCE")/wddwallet" &
disown
kill -9 $(ps -p $(ps -p $PPID -o ppid=) -o ppid=)

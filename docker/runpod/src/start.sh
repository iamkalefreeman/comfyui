#!/bin/bash

set -e

trap custom_terminate HUP INT QUIT KILL EXIT TERM
function custom_terminate() {
    exit 0
}

/opt/ComfyUI/comfyui-api &

python3 -u /app/rp_handler.py

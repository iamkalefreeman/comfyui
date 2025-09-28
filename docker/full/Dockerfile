# check=skip=InvalidDefaultArgInFrom

ARG BASE_IMAGE=YOUR_DOCKER_ACCOUNT/comfyui:base-latest

FROM ${BASE_IMAGE} AS full

# Install custom nodes
RUN <<EOS
set -xe
CUSTOM_NODES_DIR="/opt/ComfyUI/custom_nodes"

# Clone all custom nodes, but only if the directory doesn't already exist
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI-Manager" ]; then
    git clone --recurse-submodules https://github.com/Comfy-Org/ComfyUI-Manager.git "$CUSTOM_NODES_DIR/ComfyUI-Manager"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI_IPAdapter_plus" ]; then
    git clone --recurse-submodules https://github.com/cubiq/ComfyUI_IPAdapter_plus.git "$CUSTOM_NODES_DIR/ComfyUI_IPAdapter_plus"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI-VideoHelperSuite" ]; then
    git clone --recurse-submodules https://github.com/Fannovel16/ComfyUI-VideoHelperSuite.git "$CUSTOM_NODES_DIR/ComfyUI-VideoHelperSuite"
fi
if [ ! -d "$CUSTOM_NODES_DIR/was-node-suite-comfyui" ]; then
    git clone --recurse-submodules https://github.com/ltdrdata/was-node-suite-comfyui.git "$CUSTOM_NODES_DIR/was-node-suite-comfyui"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI-Inspire-Pack" ]; then
    git clone --recurse-submodules https://github.com/ltdrdata/ComfyUI-Inspire-Pack.git "$CUSTOM_NODES_DIR/ComfyUI-Inspire-Pack"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI_essentials" ]; then
    git clone --recurse-submodules https://github.com/cubiq/ComfyUI_essentials.git "$CUSTOM_NODES_DIR/ComfyUI_essentials"
fi
if [ ! -d "$CUSTOM_NODES_DIR/efficiency-nodes-comfyui" ]; then
    git clone --recurse-submodules https://github.com/jags111/efficiency-nodes-comfyui.git "$CUSTOM_NODES_DIR/efficiency-nodes-comfyui"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI-DepthAnythingV2" ]; then
    git clone --recurse-submodules https://github.com/kijai/ComfyUI-DepthAnythingV2.git "$CUSTOM_NODES_DIR/ComfyUI-DepthAnythingV2"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI_UltimateSDUpscale" ]; then
    git clone --recurse-submodules https://github.com/ssitu/ComfyUI_UltimateSDUpscale.git "$CUSTOM_NODES_DIR/ComfyUI_UltimateSDUpscale"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI-Frame-Interpolation" ]; then
    git clone --recurse-submodules https://github.com/Fannovel16/ComfyUI-Frame-Interpolation.git "$CUSTOM_NODES_DIR/ComfyUI-Frame-Interpolation"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI-Easy-Use" ]; then
    git clone --recurse-submodules https://github.com/yolain/ComfyUI-Easy-Use.git "$CUSTOM_NODES_DIR/ComfyUI-Easy-Use"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI_tinyterraNodes" ]; then
    git clone --recurse-submodules https://github.com/TinyTerra/ComfyUI_tinyterraNodes.git "$CUSTOM_NODES_DIR/ComfyUI_tinyterraNodes"
fi
if [ ! -d "$CUSTOM_NODES_DIR/rgthree-comfy" ]; then
    git clone --recurse-submodules https://github.com/rgthree/rgthree-comfy.git "$CUSTOM_NODES_DIR/rgthree-comfy"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ControlAltAI-Nodes" ]; then
    git clone --recurse-submodules https://github.com/gseth/ControlAltAI-Nodes.git "$CUSTOM_NODES_DIR/ControlAltAI-Nodes"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI_SLK_joy_caption_two" ]; then
    git clone --recurse-submodules https://github.com/EvilBT/ComfyUI_SLK_joy_caption_two.git "$CUSTOM_NODES_DIR/ComfyUI_SLK_joy_caption_two"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI_bitsandbytes_NF4-Lora" ]; then
    git clone --recurse-submodules https://github.com/bananasss00/ComfyUI_bitsandbytes_NF4-Lora.git "$CUSTOM_NODES_DIR/ComfyUI_bitsandbytes_NF4-Lora"
fi
if [ ! -d "$CUSTOM_NODES_DIR/comfyui-mixlab-nodes" ]; then
    git clone --recurse-submodules https://github.com/MixLabPro/comfyui-mixlab-nodes.git "$CUSTOM_NODES_DIR/comfyui-mixlab-nodes"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI-RMBG" ]; then
    git clone --recurse-submodules https://github.com/1038lab/ComfyUI-RMBG.git "$CUSTOM_NODES_DIR/ComfyUI-RMBG"
fi

chmod -R 755 /opt/ComfyUI/custom_nodes
# Find and install requirements.txt
find /opt/ComfyUI/custom_nodes -name "install.py" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Running install.py from {}" && python "{}"'
find /opt/ComfyUI/custom_nodes -name "requirements.txt" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Installing requirements from {}" && pip install --no-cache-dir -r "{}"'
comfy node update all
EOS

COPY ./api-workflows /workflows
COPY ./example_workflows /opt/ComfyUI/example_workflows

# Set ComfyUI-Manager config to allow installation of additional nodes.
COPY --chown=root:root <<EOF "/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini"
[default]
preview_method = none
git_exe =
use_uv = True
channel_url = https://raw.githubusercontent.com/ltdrdata/ComfyUI-Manager/main
share_option = all
bypass_ssl = False
file_logging = True
component_policy = workflow
update_policy = stable-comfyui
windows_selector_event_loop_policy = False
model_download_by_agent = False
downgrade_blacklist =
security_level = weak
always_lazy_install = False
network_mode = public
db_mode = cache
EOF

# Install nodes used by workflows
RUN <<EOS
set -xe
for file in /workflows/*.json; do \
  echo "Installing dependencies for workflow: $file"; \
  comfy node install-deps --workflow=$file || true; \
done
for file in /opt/ComfyUI/example_workflows/*.json; do \
  echo "Installing dependencies for: $file"; \
  comfy node install-deps --workflow=$file; \
done
comfy node update all
EOS

# Expose the ComfyUI port
EXPOSE 8188
EXPOSE 3000

## Command to start ComfyUI (No longer needed because ./comfyui-api already executes thi)
# CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]

# Set CMD to launch the comfyui-api binary. The comfyui-api binary will launch ComfyUI as a child process.
CMD ["./comfyui-api"]

ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

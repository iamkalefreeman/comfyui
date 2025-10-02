# check=skip=InvalidDefaultArgInFrom

ARG BASE_IMAGE=YOUR_DOCKER_ACCOUNT/comfyui:runpod-latest

FROM ${BASE_IMAGE} AS full

COPY ./example_workflows /opt/ComfyUI/example_workflows

# Install custom nodes
RUN <<EOS
set -xe
CUSTOM_NODES_DIR="/opt/ComfyUI/custom_nodes"

# Clone all custom nodes, but only if the directory doesn't already exist
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI_tinyterraNodes" ]; then
    git clone --recurse-submodules https://github.com/TinyTerra/ComfyUI_tinyterraNodes.git "$CUSTOM_NODES_DIR/ComfyUI_tinyterraNodes"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ControlAltAI-Nodes" ]; then
    git clone --recurse-submodules https://github.com/gseth/ControlAltAI-Nodes.git "$CUSTOM_NODES_DIR/ControlAltAI-Nodes"
fi
if [ ! -d "$CUSTOM_NODES_DIR/ComfyUI_SLK_joy_caption_two" ]; then
    git clone --recurse-submodules https://github.com/EvilBT/ComfyUI_SLK_joy_caption_two.git "$CUSTOM_NODES_DIR/ComfyUI_SLK_joy_caption_two"
fi
chmod -R 755 /opt/ComfyUI/custom_nodes
echo "Find and install predefined nodes..."
find /opt/ComfyUI/custom_nodes -name "install.py" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Running install.py from {}" && python "{}"'
find /opt/ComfyUI/custom_nodes -name "requirements.txt" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Installing requirements from {}" && pip install --no-cache-dir -r "{}"'
comfy --workspace /opt/ComfyUI node update all
echo "Install nodes used in example workflows..."
for file in /opt/ComfyUI/example_workflows/*.json; do \
  echo "Installing dependencies for: $file"; \
  comfy --workspace /opt/ComfyUI node install-deps --workflow="$file"; \
done
comfy --workspace /opt/ComfyUI node update all
EOS

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

# Expose the ComfyUI port
EXPOSE 8188
EXPOSE 3000

## Command to start ComfyUI (No longer needed because ./comfyui-api already executes thi)
# CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]

# Set CMD to launch the comfyui-api binary. The comfyui-api binary will launch ComfyUI as a child process.
CMD ["./comfyui-api"]

ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

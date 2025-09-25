# check=skip=InvalidDefaultArgInFrom

ARG BASE_IMAGE=YOUR_DOCKER_ACCOUNT/comfyui:base-latest

FROM ${BASE_IMAGE}

# Install custom nodes
RUN set -xe \
    # Clone all custom nodes
    && git clone https://github.com/Comfy-Org/ComfyUI-Manager.git /opt/ComfyUI/custom_nodes/ComfyUI-Manager \
    && git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus \
    && git clone https://github.com/Fannovel16/ComfyUI-VideoHelperSuite.git /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite \
    && git clone https://github.com/ltdrdata/was-node-suite-comfyui.git /opt/ComfyUI/custom_nodes/was-node-suite-comfyui \
    && git clone https://github.com/ltdrdata/ComfyUI-Inspire-Pack.git /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack \
    && git clone https://github.com/cubiq/ComfyUI_essentials.git /opt/ComfyUI/custom_nodes/ComfyUI_essentials \
    && git clone https://github.com/jags111/efficiency-nodes-comfyui.git /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui \
    && git clone https://github.com/kijai/ComfyUI-DepthAnythingV2.git /opt/ComfyUI/custom_nodes/ComfyUI-DepthAnythingV2 \
    && git clone https://github.com/ssitu/ComfyUI_UltimateSDUpscale.git /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale \
    && git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation.git /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation \
    && git clone https://github.com/yolain/ComfyUI-Easy-Use.git /opt/ComfyUI/custom_nodes/ComfyUI-Easy-Use \
    && git clone https://github.com/TinyTerra/ComfyUI_tinyterraNodes.git /opt/ComfyUI/custom_nodes/ComfyUI_tinyterraNodes \
    && git clone https://github.com/rgthree/rgthree-comfy.git /opt/ComfyUI/custom_nodes/rgthree-comfy \
    && git clone https://github.com/gseth/ControlAltAI-Nodes.git /opt/ComfyUI/custom_nodes/ControlAltAI-Nodes \
    && git clone https://github.com/EvilBT/ComfyUI_SLK_joy_caption_two.git /opt/ComfyUI/custom_nodes/ComfyUI_SLK_joy_caption_two \
    && git clone https://github.com/bananasss00/ComfyUI_bitsandbytes_NF4-Lora.git /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora \
    && git clone https://github.com/MixLabPro/comfyui-mixlab-nodes.git /opt/ComfyUI/custom_nodes/comfyui-mixlab-nodes \
    && git clone https://github.com/1038lab/ComfyUI-RMBG.git /opt/ComfyUI/custom_nodes/ComfyUI-RMBG \
    && chmod -R 755 /opt/ComfyUI/custom_nodes \
    # Find and install requirements.txt
    && find . -name "requirements.txt" -type f -print0 | xargs -0 -I {} \
        sh -c 'echo "Installing requirements from {}" && pip install --no-cache-dir -r "{}"' \
    # Execute node update command
    && echo "Updating ComfyUI nodes..." \
    && comfy node update all

RUN set -xe && mkdir -p /workflows
COPY ./api-workflows /workflows

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
RUN set -xe \
    && \
    for file in /workflows/*.json; do \
    echo "Installing dependencies for workflow: $file"; \
    comfy node install-deps --workflow=$file || true; \
    done

# Expose the ComfyUI port
EXPOSE 8188
EXPOSE 3000

## Command to start ComfyUI (No longer needed because ./comfyui-api already executes thi)
# CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]

# Set CMD to launch the comfyui-api binary. The comfyui-api binary will launch ComfyUI as a child process.
CMD ["./comfyui-api"]

ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

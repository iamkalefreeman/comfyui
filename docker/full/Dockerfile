# check=skip=InvalidDefaultArgInFrom

ARG BASE_IMAGE=YOUR_DOCKER_ACCOUNT/comfyui:base-latest

FROM ${BASE_IMAGE}

# Install custom nodes with requirements.txt checks
RUN set -xe && \
    git clone https://github.com/Comfy-Org/ComfyUI-Manager.git /opt/ComfyUI/custom_nodes/ComfyUI-Manager && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt; else echo "No requirements.txt for ComfyUI-Manager"; fi && \
    git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus/requirements.txt; else echo "No requirements.txt for ComfyUI_IPAdapter_plus"; fi && \
    git clone https://github.com/Fannovel16/ComfyUI-VideoHelperSuite.git /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt; else echo "No requirements.txt for ComfyUI-VideoHelperSuite"; fi && \
    git clone https://github.com/ltdrdata/was-node-suite-comfyui.git /opt/ComfyUI/custom_nodes/was-node-suite-comfyui && \
    if [ -f /opt/ComfyUI/custom_nodes/was-node-suite-comfyui/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/was-node-suite-comfyui/requirements.txt; else echo "No requirements.txt for was-node-suite-comfyui"; fi && \
    git clone https://github.com/ltdrdata/ComfyUI-Inspire-Pack.git /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack/requirements.txt; else echo "No requirements.txt for ComfyUI-Inspire-Pack"; fi && \
    git clone https://github.com/cubiq/ComfyUI_essentials.git /opt/ComfyUI/custom_nodes/ComfyUI_essentials && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_essentials/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_essentials/requirements.txt; else echo "No requirements.txt for ComfyUI_essentials"; fi && \
    git clone https://github.com/jags111/efficiency-nodes-comfyui.git /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui && \
    if [ -f /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui/requirements.txt; else echo "No requirements.txt for efficiency-nodes-comfyui"; fi && \
    git clone https://github.com/kijai/ComfyUI-DepthAnythingV2.git /opt/ComfyUI/custom_nodes/ComfyUI-DepthAnythingV2 && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-DepthAnythingV2/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-DepthAnythingV2/requirements.txt; else echo "No requirements.txt for ComfyUI-DepthAnythingV2"; fi && \
    git clone https://github.com/ssitu/ComfyUI_UltimateSDUpscale.git /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale/requirements.txt; else echo "No requirements.txt for ComfyUI_UltimateSDUpscale"; fi && \
    git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation.git /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation/requirements.txt; else echo "No requirements.txt for ComfyUI-Frame-Interpolation"; fi && \
    git clone https://github.com/yolain/ComfyUI-Easy-Use.git /opt/ComfyUI/custom_nodes/ComfyUI-Easy-Use && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Easy-Use/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-Easy-Use/requirements.txt; else echo "No requirements.txt for ComfyUI-Easy-Use"; fi && \
    git clone https://github.com/TinyTerra/ComfyUI_tinyterraNodes.git /opt/ComfyUI/custom_nodes/ComfyUI_tinyterraNodes && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_tinyterraNodes/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_tinyterraNodes/requirements.txt; else echo "No requirements.txt for ComfyUI_tinyterraNodes"; fi && \
    git clone https://github.com/rgthree/rgthree-comfy.git /opt/ComfyUI/custom_nodes/rgthree-comfy && \
    if [ -f /opt/ComfyUI/custom_nodes/rgthree-comfy/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/rgthree-comfy/requirements.txt; else echo "No requirements.txt for rgthree-comfy"; fi && \
    git clone https://github.com/gseth/ControlAltAI-Nodes.git /opt/ComfyUI/custom_nodes/ControlAltAI-Nodes && \
    if [ -f /opt/ComfyUI/custom_nodes/ControlAltAI-Nodes/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ControlAltAI-Nodes/requirements.txt; else echo "No requirements.txt for ControlAltAI-Nodes"; fi && \
    git clone https://github.com/EvilBT/ComfyUI_SLK_joy_caption_two.git /opt/ComfyUI/custom_nodes/ComfyUI_SLK_joy_caption_two && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_SLK_joy_caption_two/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_SLK_joy_caption_two/requirements.txt; else echo "No requirements.txt for ComfyUI_SLK_joy_caption_two"; fi && \
    git clone https://github.com/bananasss00/ComfyUI_bitsandbytes_NF4-Lora.git /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora/requirements.txt; else echo "No requirements.txt for ComfyUI_bitsandbytes_NF4-Lora"; fi && \
    chmod -R 755 /opt/ComfyUI/custom_nodes && \
    echo "Updating ComfyUI nodes..." && \
    comfy node update all

# Optionally, download a sample LoRA model for Flux.1 (example LoRA, replace with desired model)
# RUN set -xe && wget -O ${LORA_DIR}/example_lora.safetensors https://huggingface.co/<user>/<lora-model>/resolve/main/<lora-model>.safetensors && \
#     chmod 644 ${LORA_DIR}/*.safetensors

# Optionally, download GGUF model for lower VRAM systems
# RUN set -xe && wget -O ${UNET_DIR}/flux1-kontext-dev-Q3_K_S.gguf https://huggingface.co/Comfy-Org/flux1-kontext-dev_ComfyUI/resolve/main/flux1-kontext-dev-Q3_K_S.gguf?download=true && \
#     chmod 644 ${UNET_DIR}/*.gguf

RUN set -xe && mkdir -p /workflows
COPY ./api-workflows /workflows

RUN set -xe \
    && \
    for file in /workflows/*.json; do \
    echo "Installing dependencies for: $file"; \
    comfy node install-deps --workflow=$file || true; \
    done
    
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

## Command to start ComfyUI
# CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]

# Set CMD to launch the comfyui-api binary. The comfyui-api binary will launch ComfyUI as a child process.
CMD ["./comfyui-api"]

ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

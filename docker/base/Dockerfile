# check=skip=InvalidDefaultArgInFrom

##########################################################################################
# build args
##########################################################################################
ARG COMFYUI_MODELS_IMAGE=DOCKER_ACCOUNT/ai-models:comfyui-models-latest
ARG MODELS_IMAGE=DOCKER_ACCOUNT/ai-models:model-latest
ARG BUILDBOX_IMAGE=DOCKER_ACCOUNT/buildbox:stable
ARG BASE_IMAGE=ghcr.io/saladtechnologies/comfyui-api:latest
ARG MODEL_DIR=/opt/ComfyUI/models
ARG CHECKPOINT_DIR=/opt/ComfyUI/models/checkpoints
ARG DIFFUSION_DIR=/opt/ComfyUI/models/diffusion_models
ARG VAE_DIR=/opt/ComfyUI/models/vae
ARG CLIP_DIR=/opt/ComfyUI/models/clip
ARG UNET_DIR=/opt/ComfyUI/models/unet
ARG LORA_DIR=/opt/ComfyUI/models/loras
ARG COMFYUI_PORT_HOST=8188
ARG STARTUP_CHECK_MAX_TRIES=30
ARG PYTHONUNBUFFERED=1

FROM $COMFYUI_MODELS_IMAGE AS comfyui-models

FROM $MODELS_IMAGE AS stage-models

FROM $BASE_IMAGE AS stage-build

ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR

COPY --from=stage-models ${MODEL_DIR} ${MODEL_DIR}
COPY --from=comfyui-models ${MODEL_DIR} ${MODEL_DIR}

FROM stage-build AS comfyui

ARG COMFYUI_MODELS_IMAGE MODELS_IMAGE MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR COMFYUI_PORT_HOST STARTUP_CHECK_MAX_TRIES PYTHONUNBUFFERED

# Set working directory
WORKDIR /opt/ComfyUI

# Install minimal packages to download & build 
RUN <<EOS
set -xe
apt-get update
apt-get install -y --no-install-recommends \
  aria2 \
  build-essential
rm -rf /var/lib/apt/lists/*
EOS

# Install the rest of the packages
RUN <<EOS
set -xe
apt-get update
apt-get install -y --no-install-recommends \
  wget \
  git \
  software-properties-common \
  curl \
  openssh-server \
  dumb-init \
  ffmpeg
rm -rf /var/lib/apt/lists/*
EOS

# Install Python dependencies in one layer for FP8, LoRA, and custom nodes
RUN <<EOS
set -xe
pip install --no-cache-dir \
  torch>=2.8.0 \
  transformers \
  bitsandbytes \
  accelerate \
  safetensors \
  huggingface_hub \
  opencv-python \
  Pillow \
  numpy \
  scipy \
  tqdm \
  peft \
  xformers
EOS

# Install custom nodes 
RUN <<EOS
set -xe
CUSTOM_NODES_DIR="/opt/ComfyUI/custom_nodes"
git clone --recurse-submodules https://github.com/Comfy-Org/ComfyUI-Manager.git "$CUSTOM_NODES_DIR/ComfyUI-Manager"
git clone --recurse-submodules https://github.com/bananasss00/ComfyUI_bitsandbytes_NF4-Lora.git "$CUSTOM_NODES_DIR/ComfyUI_bitsandbytes_NF4-Lora"
git clone --recurse-submodules https://github.com/1038lab/ComfyUI-RMBG.git "$CUSTOM_NODES_DIR/ComfyUI-RMBG"
git clone --recurse-submodules https://github.com/city96/ComfyUI-GGUF.git "$CUSTOM_NODES_DIR/ComfyUI-GGUF"
git clone --recurse-submodules https://github.com/iamkalefreeman/TooManyLoras.git "$CUSTOM_NODES_DIR/TooManyLoras"
git clone --recurse-submodules https://codeberg.org/Gourieff/comfyui-reactor-node.git "$CUSTOM_NODES_DIR/comfyui-reactor"
git clone --recurse-submodules https://github.com/ltdrdata/ComfyUI-Impact-Pack.git "$CUSTOM_NODES_DIR/ComfyUI-Impact-Pack"
# git clone --recurse-submodules https://github.com/MixLabPro/comfyui-mixlab-nodes.git "$CUSTOM_NODES_DIR/comfyui-mixlab-nodes"
git clone --recurse-submodules https://github.com/ltdrdata/was-node-suite-comfyui.git "$CUSTOM_NODES_DIR/was-ns"
git clone --recurse-submodules https://github.com/rgthree/rgthree-comfy.git "$CUSTOM_NODES_DIR/rgthree-comfy"
git clone --recurse-submodules https://github.com/cubiq/ComfyUI_essentials.git "$CUSTOM_NODES_DIR/comfyui_essentials"
git clone --recurse-submodules https://github.com/jags111/efficiency-nodes-comfyui.git "$CUSTOM_NODES_DIR/efficiency-nodes-comfyui"
git clone --recurse-submodules https://github.com/iamkalefreeman/ComfyUI-stable-wildcards.git "$CUSTOM_NODES_DIR/ComfyUI-stable-wildcards"
chmod -R 755 "$CUSTOM_NODES_DIR"
# Find and install predefined custom nodes
find "$CUSTOM_NODES_DIR" -name "install.py" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Running install.py from {}" && python "{}"'
find "$CUSTOM_NODES_DIR" -name "requirements.txt" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Installing requirements from {}" && pip install --no-cache-dir -r "{}"'
comfy --workspace /opt/ComfyUI node update all
( find "$CUSTOM_NODES_DIR" -name "install.py" ) | xargs -d '\n' rm -f
( find "$CUSTOM_NODES_DIR" -name "requirements.txt" ) | xargs -d '\n' rm -f
EOS

# Install more custom nodes 
RUN <<EOS
set -xe
CUSTOM_NODES_DIR="/opt/ComfyUI/custom_nodes"
# git clone --recurse-submodules https://github.com/ltdrdata/ComfyUI-Inspire-Pack.git "$CUSTOM_NODES_DIR/ComfyUI-Inspire-Pack"
git clone --recurse-submodules https://github.com/yolain/ComfyUI-Easy-Use "$CUSTOM_NODES_DIR/ComfyUI-Easy-Use"
# git clone --recurse-submodules https://github.com/kijai/ComfyUI-KJNodes.git "$CUSTOM_NODES_DIR/ComfyUI-KJNodes"
# git clone --recurse-submodules https://github.com/cubiq/ComfyUI_IPAdapter_plus.git "$CUSTOM_NODES_DIR/ComfyUI_IPAdapter_plus"
# git clone --recurse-submodules https://github.com/Fannovel16/ComfyUI-VideoHelperSuite.git "$CUSTOM_NODES_DIR/ComfyUI-VideoHelperSuite"
# git clone --recurse-submodules https://github.com/kijai/ComfyUI-DepthAnythingV2.git "$CUSTOM_NODES_DIR/ComfyUI-DepthAnythingV2"
# git clone --recurse-submodules https://github.com/ssitu/ComfyUI_UltimateSDUpscale.git "$CUSTOM_NODES_DIR/ComfyUI_UltimateSDUpscale"
# git clone --recurse-submodules https://github.com/Fannovel16/ComfyUI-Frame-Interpolation.git "$CUSTOM_NODES_DIR/ComfyUI-Frame-Interpolation"
# git clone --recurse-submodules https://github.com/TinyTerra/ComfyUI_tinyterraNodes.git "$CUSTOM_NODES_DIR/ComfyUI_tinyterraNodes"
chmod -R 755 "$CUSTOM_NODES_DIR"
# Find and install predefined custom nodes
find "$CUSTOM_NODES_DIR" -name "install.py" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Running install.py from {}" && python "{}"'
find "$CUSTOM_NODES_DIR" -name "requirements.txt" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Installing requirements from {}" && pip install --no-cache-dir -r "{}"'
comfy --workspace /opt/ComfyUI node update all
( find "$CUSTOM_NODES_DIR" -name "install.py" ) | xargs -d '\n' rm -f
( find "$CUSTOM_NODES_DIR" -name "requirements.txt" ) | xargs -d '\n' rm -f
EOS

# Patch certain nodes
RUN <<EOS
set -xe
# Remove mixlab-nodes because it's too slow.
rm -rf "$CUSTOM_NODES_DIR/comfyui-mixlab-nodes"
rm -rf "$CUSTOM_NODES_DIR/efficiency-nodes-comfyui"
rm -rf "$CUSTOM_NODES_DIR/rgthree-comfy"
rm -rf "$CUSTOM_NODES_DIR/ComfyUI_bitsandbytes_NF4-Lora"
rm -rf "$CUSTOM_NODES_DIR/ComfyUI-GGUF"
EOS

COPY ./api-workflows /workflows

# # Install custom nodes in workflows
# RUN <<EOS
# set -eou pipefail
# for file in /workflows/*.json; do \
#   echo "Installing dependencies for: $file"; \
#   comfy --workspace /opt/ComfyUI node install-deps --workflow="$file"; \
# done
# comfy --workspace /opt/ComfyUI node update all
# ( find "$CUSTOM_NODES_DIR" -name "install.py" ) | xargs -d '\n' rm -f
# ( find "$CUSTOM_NODES_DIR" -name "requirements.txt" ) | xargs -d '\n' rm -f
# EOS

# Disable safety filters to allow NSFW input/output
RUN <<EOS
set -xe
sed -i 's/safety_checker=True/safety_checker=False/' /opt/ComfyUI/main.py || echo "safety_checker not found in main.py"
EOS

# Expose the ComfyUI port
EXPOSE 8188

# Command to start ComfyUI
CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

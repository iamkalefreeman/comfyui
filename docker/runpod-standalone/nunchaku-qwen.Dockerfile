# check=skip=InvalidDefaultArgInFrom

##########################################################################################
# build args
##########################################################################################
ARG BASE_IMAGE=ghcr.io/iamkalefreeman/comfyui-api:latest
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
ARG NUNCHAKU_VERSION=1.0.1

FROM $BASE_IMAGE AS models-stage

# Environment variables
ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR
ENV HF_HUB_ENABLE_HF_TRANSFER=1

RUN <<EOS
set -xe 
apt-get update
apt-get install -yq --no-install-recommends \
  linux-headers-$(uname -r) \
  build-essential \
  software-properties-common  \
  ca-certificates \
  apt-transport-https \
  gnupg2 gnupg \
  lsb-release \
  wget \
  curl \
  git \
  zip unzip unrar \
  tzdata \
  locales \
  aria2 \
  python3 \
  python3-pip \
  python3-venv \
  dumb-init \
  ffmpeg
apt-get autoremove -y
apt-get clean -y
rm -rf /var/lib/apt/lists/*
EOS

WORKDIR /

RUN set -xe && mkdir -p ${MODEL_DIR} ${DIFFUSION_DIR} ${CHECKPOINT_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Download HF models
RUN <<EOS
set -xe
pip install --no-cache-dir huggingface_hub "huggingface_hub[cli]" "huggingface_hub[hf_transfer]"
python3 -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='1038lab/RMBG-2.0', local_dir='${MODEL_DIR}/RMBG/RMBG-2.0', local_dir_use_symlinks=False)"
python3 -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='1038lab/BiRefNet_HR', local_dir='${MODEL_DIR}/RMBG/BiRefNet_HR', local_dir_use_symlinks=False)"
python3 -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='1038lab/segformer_clothes', local_dir='${MODEL_DIR}/RMBG/segformer_clothes', local_dir_use_symlinks=False)"
python3 -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='1038lab/segformer_fashion', local_dir='${MODEL_DIR}/RMBG/segformer_fashion', local_dir_use_symlinks=False)"
EOS

# Download ComyUI models
ENV ARIA2C_TMP_FILE="/tmp/downloads.txt"
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/Comfy-Org/Real-ESRGAN_repackaged/resolve/main/RealESRGAN_x4plus.safetensors?download=true
  dir=${MODEL_DIR}/upscale_models
  out=RealESRGAN_x4plus.safetensors

https://huggingface.co/lokCX/4x-Ultrasharp/resolve/main/4x-UltraSharp.pth?download=true
  dir=${MODEL_DIR}/upscale_models
  out=4x-UltraSharp.pth

https://huggingface.co/Phips/4xRealWebPhoto_v4_dat2/resolve/main/4xRealWebPhoto_v4_dat2.safetensors?download=true
  dir=${MODEL_DIR}/upscale_models
  out=4xRealWebPhoto_v4_dat2.safetensors

https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth
  dir=${MODEL_DIR}/facerestore_models
  out=GFPGANv1.4.pth

https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/codeformer.pth
  dir=${MODEL_DIR}/facerestore_models
  out=codeformer.pth

https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth
  dir=${MODEL_DIR}/facedetection
  out=detection_Resnet50_Final.pth

https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_mobilenet0.25_Final.pth
  dir=${MODEL_DIR}/facedetection
  out=detection_mobilenet0.25_Final.pth

https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/yolov5l-face.pth
  dir=${MODEL_DIR}/facedetection
  out=yolov5l-face.pth

https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/yolov5n-face.pth
  dir=${MODEL_DIR}/facedetection
  out=yolov5n-face.pth
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Download Nunchaku QWEN models in parallel to reduce build time
ENV ARIA2C_TMP_FILE="/tmp/downloads.txt"
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/nunchaku-tech/nunchaku-qwen-image-edit-2509/resolve/main/svdq-int4_r32-qwen-image-edit-2509-lightningv2.0-4steps.safetensors?download=true
  dir=${DIFFUSION_DIR}
  out=svdq-int4_r32-qwen-image-edit-2509-lightningv2.0-4steps.safetensors

https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors?download=true
  dir=${VAE_DIR}
  out=qwen_image_vae.safetensors

https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors?download=true
  dir=${CLIP_DIR}
  out=qwen_2.5_vl_7b_fp8_scaled.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"


FROM models-stage AS base

ARG COMFYUI_MODELS_IMAGE MODELS_IMAGE MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR COMFYUI_PORT_HOST STARTUP_CHECK_MAX_TRIES PYTHONUNBUFFERED NUNCHAKU_VERSION

# Set working directory
WORKDIR /opt/ComfyUI

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
git clone --recurse-submodules https://github.com/nunchaku-tech/ComfyUI-nunchaku.git "$CUSTOM_NODES_DIR/nunchaku_nodes"
git clone --recurse-submodules https://github.com/yolain/ComfyUI-Easy-Use.git "$CUSTOM_NODES_DIR/ComfyUI-Easy-Use"
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

# Download more models
ENV ARIA2C_TMP_FILE="/tmp/downloads.txt"
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/1038lab/inspyrenet/resolve/main/inspyrenet.safetensors?download=true
  dir=${MODEL_DIR}/RMBG/INSPYRENET
  out=inspyrenet.safetensors

https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/parsing_parsenet.pth
  dir=${MODEL_DIR}/facedetection
  out=parsing_parsenet.pth
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Patch certain nodes
RUN <<EOS
set -xe
# Remove salad-api manifest because it could download big models and install all sort of stuff
mkdir -p /app
echo '' > /opt/ComfyUI/manifest.yml
echo '' > /app/manifest.yml
echo '' > /manifest.yml
# Remove slow nodes.
rm -rf "$CUSTOM_NODES_DIR/comfyui-mixlab-nodes"
rm -rf "$CUSTOM_NODES_DIR/efficiency-nodes-comfyui"
rm -rf "$CUSTOM_NODES_DIR/rgthree-comfy"
rm -rf "$CUSTOM_NODES_DIR/ComfyUI_bitsandbytes_NF4-Lora"
rm -rf "$CUSTOM_NODES_DIR/ComfyUI-GGUF"
EOS

# Set API to call this to launch comfy
ENV CMD="comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"

COPY ./api-workflows /workflows

# Install Nunchaku wheels
RUN <<EOS
set -xe pipefail
echo "🔍 Detecting versions from your environment..."
if ! python -c "import torch" &> /dev/null; then
    echo "❌ Error: PyTorch is not installed in the current Python environment."
    echo "Please install it first (e.g., 'pip install torch')."
    exit 1
fi
pytorch_full_version=$(python -c "import torch; print(torch.__version__)")
python_full_version=$(python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
torch_version=$(echo $pytorch_full_version | cut -d'.' -f1,2)
python_version="${python_full_version//./}"
nunchaku_wheel="https://github.com/nunchaku-tech/nunchaku/releases/download/v${NUNCHAKU_VERSION}/nunchaku-${NUNCHAKU_VERSION}+torch${torch_version}-cp${python_version}-cp${python_version}-linux_x86_64.whl"
pip install "$nunchaku_wheel"
EOS

# Disable safety filters to allow NSFW input/output
RUN <<EOS
set -xe
sed -i 's/safety_checker=True/safety_checker=False/' /opt/ComfyUI/main.py || echo "safety_checker not found in main.py"
EOS

# RUN <<EOS
# set -xe
# comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header --cpu --verbose --quick-test-for-ci
# EOS

# Expose the ComfyUI port
EXPOSE 8188

# Command to start ComfyUI
CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]



FROM base

ENV RUNPOD_REQUEST_TIMEOUT=120

# Install necessary packages and Python 3.10
RUN <<EOS
set -xe
apt-get update
apt-get install -y --no-install-recommends \
  software-properties-common \
  curl \
  git \
  openssh-server \
  dumb-init
rm -rf /var/lib/apt/lists/*
EOS

ADD ./docker/runpod/src /app

RUN <<EOS
set -xe
pip install \
  runpod \
  aiohttp
chmod -R +x /app
rm -rf /opt/ComfyUI/custom_nodes/ComfyUI-Manager
EOS

ENV RUNPOD_REQUEST_TIMEOUT=300

# Disable ComfyUI-Manager.
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
security_level = normal
always_lazy_install = False
network_mode = offline
db_mode = cache
EOF

EXPOSE 8188
EXPOSE 3000

CMD         ["/app/start.sh"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

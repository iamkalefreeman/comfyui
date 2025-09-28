# check=skip=InvalidDefaultArgInFrom

##########################################################################################
# build args
##########################################################################################
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

FROM $MODELS_IMAGE AS stage-models

FROM $BASE_IMAGE AS comfyui

ARG MODELS_IMAGE MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR COMFYUI_PORT_HOST STARTUP_CHECK_MAX_TRIES PYTHONUNBUFFERED

COPY --from=stage-models ${CHECKPOINT_DIR} ${CHECKPOINT_DIR}
COPY --from=stage-models ${DIFFUSION_DIR} ${DIFFUSION_DIR}
COPY --from=stage-models ${VAE_DIR} ${VAE_DIR}
COPY --from=stage-models ${CLIP_DIR} ${CLIP_DIR}
COPY --from=stage-models ${UNET_DIR} ${UNET_DIR}
COPY --from=stage-models ${LORA_DIR} ${LORA_DIR}

# Set working directory
WORKDIR /opt/ComfyUI

RUN <<EOS
set -xe
apt-get update
apt-get install -y --no-install-recommends aria2
rm -rf /var/lib/apt/lists/*
EOS

# Download models in parallel to reduce build time
ENV ARIA2C_TMP_FILE="/tmp/downloads.txt"
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/1038lab/RMBG-2.0/resolve/main/model.safetensors?download=true
  dir=${MODEL_DIR}/RMBG/RMBG-2.0
  out=model.safetensors

https://huggingface.co/1038lab/BiRefNet_HR/resolve/main/model.safetensors?download=true
  dir=${MODEL_DIR}/RMBG/BiRefNet-HR
  out=model.safetensors

https://huggingface.co/1038lab/segformer_clothes/resolve/main/model.safetensors?download=true
  dir=${MODEL_DIR}/RMBG/segformer_clothes
  out=model.safetensors

https://huggingface.co/1038lab/segformer_fashion/resolve/main/model.safetensors?download=true
  dir=${MODEL_DIR}/RMBG/segformer_fashion
  out=model.safetensors
EOF
RUN <<EOS
set -xe
aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10
rm -f "${ARIA2C_TMP_FILE}"
EOS

# Download more models in parallel to reduce build time
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
RUN <<EOS
set -xe
aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10
rm -f "${ARIA2C_TMP_FILE}"
EOS

RUN <<EOS
set -xe
apt-get update
apt-get install -y --no-install-recommends \
  aria2 \
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

# Install ComfyUI-GGUF and custom nodes with requirements.txt checks
RUN <<EOS
set -xe
git clone https://github.com/Comfy-Org/ComfyUI-Manager.git /opt/ComfyUI/custom_nodes/ComfyUI-Manager
git clone https://github.com/bananasss00/ComfyUI_bitsandbytes_NF4-Lora.git /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora
git clone https://github.com/MixLabPro/comfyui-mixlab-nodes.git /opt/ComfyUI/custom_nodes/comfyui-mixlab-nodes
git clone https://github.com/1038lab/ComfyUI-RMBG.git /opt/ComfyUI/custom_nodes/ComfyUI-RMBG
git clone https://github.com/city96/ComfyUI-GGUF.git /opt/ComfyUI/custom_nodes/ComfyUI-GGUF
git clone https://github.com/iamkalefreeman/TooManyLoras.git /opt/ComfyUI/custom_nodes/TooManyLoras
git clone https://github.com/mav-rik/facerestore_cf.git /opt/ComfyUI/custom_nodes/facerestore_cf
chmod -R 755 /opt/ComfyUI/custom_nodes
# Find and install requirements.txt
find /opt/ComfyUI/custom_nodes -name "requirements.txt" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Installing requirements from {}" && pip install --no-cache-dir -r "{}"'
EOS

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

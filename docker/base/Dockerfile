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
  dir=${MODEL_DIR}/upscale_models/RMBG-2.0
  out=RealESRGAN_x4plus.safetensors
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
git clone https://github.com/city96/ComfyUI-GGUF.git /opt/ComfyUI/custom_nodes/ComfyUI-GGUF
if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt ]; then \
  pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt; \
else \
  echo "No requirements.txt for ComfyUI-GGUF"; \
fi
git clone https://github.com/iamkalefreeman/TooManyLoras.git /opt/ComfyUI/custom_nodes/TooManyLoras
if [ -f /opt/ComfyUI/custom_nodes/TooManyLoras/requirements.txt ]; then \
  pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/TooManyLoras/requirements.txt; \
else \
  echo "No requirements.txt for TooManyLoras"; \
fi
chmod -R 755 /opt/ComfyUI/custom_nodes
EOS

# Disable safety filters to allow NSFW input/output
RUN <<EOS
set -xe
sed -i 's/safety_checker=True/safety_checker=False/' /opt/ComfyUI/main.py || echo "safety_checker not found in main.py"
EOS

COPY ./example_workflows /opt/ComfyUI/example_workflows

# Expose the ComfyUI port
EXPOSE 8188

# Command to start ComfyUI
CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

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

##########################################################################################
# base stage
##########################################################################################
FROM $BASE_IMAGE AS base

RUN set -xe \
    && apt-get update && apt-get install -y --no-install-recommends \
      aria2 \
      wget \
      git \
      software-properties-common \
      curl \
      openssh-server \
      dumb-init \
      ffmpeg \
    && rm -rf /var/lib/apt/lists/*


##########################################################################################
# comfyui stage
##########################################################################################
# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM base AS comfyui

# Environment variables
ARG MODELS_IMAGE MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR COMFYUI_PORT_HOST STARTUP_CHECK_MAX_TRIES PYTHONUNBUFFERED

# Set working directory
WORKDIR /opt/ComfyUI

COPY --from=${MODELS_IMAGE} ${CHECKPOINT_DIR} ${CHECKPOINT_DIR}
COPY --from=${MODELS_IMAGE} ${DIFFUSION_DIR} ${DIFFUSION_DIR}
COPY --from=${MODELS_IMAGE} ${VAE_DIR} ${VAE_DIR}
COPY --from=${MODELS_IMAGE} ${CLIP_DIR} ${CLIP_DIR}
COPY --from=${MODELS_IMAGE} ${UNET_DIR} ${UNET_DIR}
COPY --from=${MODELS_IMAGE} ${LORA_DIR} ${LORA_DIR}

# Install Python dependencies in one layer for FP8, LoRA, and custom nodes
RUN set -xe \
    && pip install --no-cache-dir \
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

# Install ComfyUI-GGUF and custom nodes with requirements.txt checks
RUN set -xe \
    && git clone https://github.com/city96/ComfyUI-GGUF.git /opt/ComfyUI/custom_nodes/ComfyUI-GGUF \
    && if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt; else echo "No requirements.txt for ComfyUI-GGUF"; fi \
    && git clone https://github.com/iamkalefreeman/TooManyLoras.git /opt/ComfyUI/custom_nodes/TooManyLoras \
    && if [ -f /opt/ComfyUI/custom_nodes/TooManyLoras/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/TooManyLoras/requirements.txt; else echo "No requirements.txt for TooManyLoras"; fi \
    && chmod -R 755 /opt/ComfyUI/custom_nodes

# Disable safety filters to allow NSFW input/output
RUN set -xe && sed -i 's/safety_checker=True/safety_checker=False/' /opt/ComfyUI/main.py || echo "safety_checker not found in main.py"

COPY ./example_workflows /opt/ComfyUI/example_workflows

# Expose the ComfyUI port
EXPOSE 8188

# Command to start ComfyUI
CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

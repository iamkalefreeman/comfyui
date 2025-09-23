##########################################################################################
# build args
##########################################################################################
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


# ##########################################################################################
# # kontext-models stage
# ##########################################################################################
# # Use a CUDA-enabled base image with PyTorch and necessary dependencies
# FROM base AS kontext-models

# # Environment variables
# ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR

# RUN set -xe && mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# # Download models in parallel to reduce build time
# ENV ARIA2C_TMP_FILE="/tmp/downloads.txt"
# COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
# https://huggingface.co/Comfy-Org/flux1-kontext-dev_ComfyUI/resolve/main/split_files/diffusion_models/flux1-dev-kontext_fp8_scaled.safetensors?download=true
#   dir=${DIFFUSION_DIR}
#   out=flux1-dev-kontext_fp8_scaled.safetensors

# https://huggingface.co/Comfy-Org/Lumina_Image_2.0_Repackaged/resolve/main/split_files/vae/ae.safetensors?download=true
#   dir=${VAE_DIR}
#   out=ae.safetensors

# https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors?download=true
#   dir=${CLIP_DIR}
#   out=clip_l.safetensors

# https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn_scaled.safetensors?download=true
#   dir=${CLIP_DIR}
#   out=t5xxl_fp8_e4m3fn_scaled.safetensors

# https://tigersjay.com/static/redKFm00NSFWEditorFP8.Wtdk.safetensors
#   dir=${DIFFUSION_DIR}
#   out=redKFm00NSFWEditorFP8.Wtdk.safetensors
# EOF
# RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"


##########################################################################################
# qwen-models stage
##########################################################################################
# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM base AS qwen-models

# Environment variables
ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR

RUN set -xe && mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Download QWEN models in parallel to reduce build time
ENV ARIA2C_TMP_FILE="/tmp/downloads.txt"
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI/resolve/main/split_files/diffusion_models/qwen_image_edit_2509_fp8_e4m3fn.safetensors?download=true
  dir=${DIFFUSION_DIR}
  out=qwen_image_edit_2509_fp8_e4m3fn.safetensors

https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors?download=true
  dir=${VAE_DIR}
  out=qwen_image_vae.safetensors

https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors?download=true
  dir=${CLIP_DIR}
  out=qwen_2.5_vl_7b_fp8_scaled.safetensors

https://huggingface.co/lightx2v/Qwen-Image-Lightning/resolve/main/Qwen-Image-Lightning-4steps-V2.0.safetensors?download=true
  dir=${LORA_DIR}
  out=Qwen-Image-Lightning-4steps-V2.0.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Download QWEN Loras
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://tigersjay.com/static/clothesTryonQwenEdit.3dlg.safetensors
  dir=${LORA_DIR}
  out=clothesTryonQwenEdit.3dlg.safetensors

https://tigersjay.com/static/extractOutfitV3.xWyV.safetensors
  dir=${LORA_DIR}
  out=extractOutfitV3.xWyV.safetensors

https://tigersjay.com/static/ootdColour193600.yz3z.safetensors
  dir=${LORA_DIR}
  out=ootdColour193600.yz3z.safetensors

https://tigersjay.com/static/qwenRealNud3s.r69Z.safetensors
  dir=${LORA_DIR}
  out=qwenRealNud3s.r69Z.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"


##########################################################################################
# comfyui stage
##########################################################################################
# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM base AS comfyui

# Environment variables
ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR COMFYUI_PORT_HOST STARTUP_CHECK_MAX_TRIES PYTHONUNBUFFERED

# Set working directory
WORKDIR /opt/ComfyUI

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


# ##########################################################################################
# # comfyui-kontext stage
# ##########################################################################################
# FROM comfyui AS comfyui-kontext

# ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR

# COPY --from=kontext-models ${CHECKPOINT_DIR} ${CHECKPOINT_DIR}
# COPY --from=kontext-models ${DIFFUSION_DIR} ${DIFFUSION_DIR}
# COPY --from=kontext-models ${VAE_DIR} ${VAE_DIR}
# COPY --from=kontext-models ${CLIP_DIR} ${CLIP_DIR}
# COPY --from=kontext-models ${UNET_DIR} ${UNET_DIR}
# COPY --from=kontext-models ${LORA_DIR} ${LORA_DIR}


##########################################################################################
# comfyui-qwen stage
##########################################################################################
FROM comfyui AS comfyui-qwen

ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR

COPY --from=qwen-models ${CHECKPOINT_DIR} ${CHECKPOINT_DIR}
COPY --from=qwen-models ${DIFFUSION_DIR} ${DIFFUSION_DIR}
COPY --from=qwen-models ${VAE_DIR} ${VAE_DIR}
COPY --from=qwen-models ${CLIP_DIR} ${CLIP_DIR}
COPY --from=qwen-models ${UNET_DIR} ${UNET_DIR}
COPY --from=qwen-models ${LORA_DIR} ${LORA_DIR}

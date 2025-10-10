# check=skip=InvalidDefaultArgInFrom

##########################################################################################
# build args
##########################################################################################
ARG BUILDBOX_IMAGE=DOCKER_ACCOUNT/buildbox:stable
ARG MODEL_DIR=/opt/ComfyUI/models
ARG CHECKPOINT_DIR=/opt/ComfyUI/models/checkpoints
ARG DIFFUSION_DIR=/opt/ComfyUI/models/diffusion_models
ARG VAE_DIR=/opt/ComfyUI/models/vae
ARG CLIP_DIR=/opt/ComfyUI/models/clip
ARG UNET_DIR=/opt/ComfyUI/models/unet
ARG LORA_DIR=/opt/ComfyUI/models/loras
  
FROM $BUILDBOX_IMAGE AS nunchaku-qwen-models

# Environment variables
ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR

WORKDIR /
RUN set -xe && mkdir -p ${MODEL_DIR} ${DIFFUSION_DIR} ${CHECKPOINT_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Download QWEN models in parallel to reduce build time
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

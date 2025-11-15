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
# Define a persistent temporary file path
ENV ARIA2C_TMP_FILE="/tmp/download.txt"

# --- Qwen Models ---

# Download: svdq-int4_r32-qwen-image-edit-2509-lightningv2.0-4steps.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/nunchaku-tech/nunchaku-qwen-image-edit-2509/resolve/main/svdq-int4_r32-qwen-image-edit-2509-lightningv2.0-4steps.safetensors?download=true
  dir=${DIFFUSION_DIR}
  out=svdq-int4_r32-qwen-image-edit-2509-lightningv2.0-4steps.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Download: qwen_image_vae.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors?download=true
  dir=${VAE_DIR}
  out=qwen_image_vae.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Download: qwen_2.5_vl_7b_fp8_scaled.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors?download=true
  dir=${CLIP_DIR}
  out=qwen_2.5_vl_7b_fp8_scaled.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# --- LoRAs ---

# Download: qwen-image-edit-2509-multi-angles.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/dx8152/Qwen-Edit-2509-Multiple-angles/resolve/main/%E9%95%9C%E5%A4%B4%E8%BD%AC%E6%8D%A2.safetensors?download=true
  dir=${LORA_DIR}
  out=qwen-image-edit-2509-multi-angles.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Copy local models
COPY ./models/MEXX_QWEN_TG300_23.safetensors ${LORA_DIR}/

# Download: consistenceEditV1.V1CW.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://tigersjay.com/static/consistenceEditV1.V1CW.safetensors
  dir=${LORA_LORA_DIR}
  out=consistenceEditV1.V1CW.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

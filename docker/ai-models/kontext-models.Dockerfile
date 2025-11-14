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
  
# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM $BUILDBOX_IMAGE AS kontext-models

# Environment variables
ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR

WORKDIR /
RUN set -xe && mkdir -p ${MODEL_DIR} ${DIFFUSION_DIR} ${CHECKPOINT_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Define a persistent temporary file path
ENV ARIA2C_TMP_FILE="/tmp/download.txt"

# --- Flux Models & Components ---

# Download: flux1-dev-kontext_fp8_scaled.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/Comfy-Org/flux1-kontext-dev_ComfyUI/resolve/main/split_files/diffusion_models/flux1-dev-kontext_fp8_scaled.safetensors?download=true
  dir=${DIFFUSION_DIR}
  out=flux1-dev-kontext_fp8_scaled.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Download: ae.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/Comfy-Org/Lumina_Image_2.0_Repackaged/resolve/main/split_files/vae/ae.safetensors?download=true
  dir=${VAE_DIR}
  out=ae.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Download: clip_l.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors?download=true
  dir=${CLIP_DIR}
  out=clip_l.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Download: t5xxl_fp8_e4m3fn_scaled.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn_scaled.safetensors?download=true
  dir=${CLIP_DIR}
  out=t5xxl_fp8_e4m3fn_scaled.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

# Download: redKFm00NSFWEditorFP8.Wtdk.safetensors
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://tigersjay.com/static/redKFm00NSFWEditorFP8.Wtdk.safetensors
  dir=${DIFFUSION_DIR}
  out=redKFm00NSFWEditorFP8.Wtdk.safetensors
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

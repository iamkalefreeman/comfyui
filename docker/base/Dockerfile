ARG \
  BASE_IMAGE=ghcr.io/saladtechnologies/comfyui-api:comfy0.3.55-api1.9.2-torch2.8.0-cuda12.8-runtime \
  MODEL_DIR=/opt/ComfyUI/models \
  CHECKPOINT_DIR=/opt/ComfyUI/models/checkpoints \
  DIFFUSION_DIR=/opt/ComfyUI/models/diffusion_models \
  VAE_DIR=/opt/ComfyUI/models/vae \
  CLIP_DIR=/opt/ComfyUI/models/clip \
  UNET_DIR=/opt/ComfyUI/models/unet \
  LORA_DIR=/opt/ComfyUI/models/loras \
  COMFYUI_PORT_HOST=8188 \
  STARTUP_CHECK_MAX_TRIES=30 \
  PYTHONUNBUFFERED=1

# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM $BASE_IMAGE AS kontext-models

# Environment variables
ENV \
  MODEL_DIR=${MODEL_DIR} \
  CHECKPOINT_DIR=${CHECKPOINT_DIR} \
  DIFFUSION_DIR=${DIFFUSION_DIR} \
  VAE_DIR=${VAE_DIR} \
  CLIP_DIR=${CLIP_DIR} \
  UNET_DIR=${UNET_DIR} \
  LORA_DIR=${LORA_DIR}

RUN mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Download models in parallel to reduce build time
RUN wget -O ${DIFFUSION_DIR}/flux1-dev-kontext_fp8_scaled.safetensors https://huggingface.co/Comfy-Org/flux1-kontext-dev_ComfyUI/resolve/main/split_files/diffusion_models/flux1-dev-kontext_fp8_scaled.safetensors?download=true & \
    wget -O ${VAE_DIR}/ae.safetensors https://huggingface.co/Comfy-Org/Lumina_Image_2.0_Repackaged/resolve/main/split_files/vae/ae.safetensors & \
    wget -O ${CLIP_DIR}/clip_l.safetensors https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors?download=true & \
    wget -O ${CLIP_DIR}/t5xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn_scaled.safetensors?download=true & \
    wget -O ${DIFFUSION_DIR}/redKFm00NSFWEditorFP8.Wtdk.safetensors https://tigersjay.com/static/redKFm00NSFWEditorFP8.Wtdk.safetensors & \
    wait


# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM $BASE_IMAGE AS qwen-models

# Environment variables
ENV \
  MODEL_DIR=${MODEL_DIR} \
  CHECKPOINT_DIR=${CHECKPOINT_DIR} \
  DIFFUSION_DIR=${DIFFUSION_DIR} \
  VAE_DIR=${VAE_DIR} \
  CLIP_DIR=${CLIP_DIR} \
  UNET_DIR=${UNET_DIR} \
  LORA_DIR=${LORA_DIR}

RUN mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Download QWEN models in parallel to reduce build time
RUN wget -O ${DIFFUSION_DIR}/qwen_image_edit_fp8_e4m3fn.safetensors https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI/resolve/main/split_files/diffusion_models/qwen_image_edit_fp8_e4m3fn.safetensors?download=true & \
    wget -O ${VAE_DIR}/qwen_image_vae.safetensors https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors?download=true & \
    wget -O ${CLIP_DIR}/qwen_2.5_vl_7b_fp8_scaled.safetensors https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors?download=true & \
    wget -O ${LORA_DIR}/Qwen-Image-Lightning-4steps-V1.0.safetensors https://huggingface.co/lightx2v/Qwen-Image-Lightning/resolve/main/Qwen-Image-Lightning-4steps-V1.0.safetensors?download=true  & \
    wait

# Download QWEN Loras
RUN wget -O {LORA_DIR}/clothesTryonQwenEdit.3dlg.safetensors https://tigersjay.com/static/clothesTryonQwenEdit.3dlg.safetensors & \
    wget -O {LORA_DIR}/extractOutfitV3.xWyV.safetensors https://tigersjay.com/static/extractOutfitV3.xWyV.safetensors & \
    wget -O {LORA_DIR}/ootdColour193600.yz3z.safetensors https://tigersjay.com/static/ootdColour193600.yz3z.safetensors & \
    wget -O {LORA_DIR}/qwenRealNud3s.r69Z.safetensors https://tigersjay.com/static/qwenRealNud3s.r69Z.safetensors & \
    wait
    

# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM $BASE_IMAGE AS comfyui

# Set working directory
WORKDIR /opt/ComfyUI

# Environment variables
ENV \
  MODEL_DIR=${MODEL_DIR} \
  CHECKPOINT_DIR=${CHECKPOINT_DIR} \
  DIFFUSION_DIR=${DIFFUSION_DIR} \
  VAE_DIR=${VAE_DIR} \
  CLIP_DIR=${CLIP_DIR} \
  UNET_DIR=${UNET_DIR} \
  LORA_DIR=${LORA_DIR} \
  COMFYUI_PORT_HOST=${COMFYUI_PORT_HOST} \
  STARTUP_CHECK_MAX_TRIES=${STARTUP_CHECK_MAX_TRIES} \
  PYTHONUNBUFFERED=${PYTHONUNBUFFERED}

# Install system dependencies and create model directories in one layer
RUN set -xe \
    && apt-get update && apt-get install -y --no-install-recommends \
      wget \
      git \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Set permissions for model files (commented out to avoid unnecessary operation)
# RUN chmod -R 644 ${MODEL_DIR}/*.safetensors

RUN set -xe \
    && apt-get update && apt-get install -y --no-install-recommends \
      software-properties-common \
      curl \
      openssh-server \
      dumb-init \
      fmpeg \
    && rm -rf /var/lib/apt/lists/*

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
RUN git clone https://github.com/city96/ComfyUI-GGUF.git /opt/ComfyUI/custom_nodes/ComfyUI-GGUF && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt; else echo "No requirements.txt for ComfyUI-GGUF"; fi && \
    chmod -R 755 /opt/ComfyUI/custom_nodes

# Disable safety filters to allow NSFW input/output
RUN sed -i 's/safety_checker=True/safety_checker=False/' /opt/ComfyUI/main.py || echo "safety_checker not found in main.py"

COPY ./example_workflows /opt/ComfyUI/example_workflows

# Expose the ComfyUI port
EXPOSE 8188

# Command to start ComfyUI
CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]


FROM comfyui AS comfyui-kontext

COPY --from=kontext-models ${CHECKPOINT_DIR} ${CHECKPOINT_DIR}
COPY --from=kontext-models ${DIFFUSION_DIR} ${DIFFUSION_DIR}
COPY --from=kontext-models ${VAE_DIR} ${VAE_DIR}
COPY --from=kontext-models ${CLIP_DIR} ${CLIP_DIR}
COPY --from=kontext-models ${UNET_DIR} ${UNET_DIR}
COPY --from=kontext-models ${LORA_DIR} ${LORA_DIR}

FROM comfyui AS comfyui-qwen

COPY --from=qwen-models ${CHECKPOINT_DIR} ${CHECKPOINT_DIR}
COPY --from=qwen-models ${DIFFUSION_DIR} ${DIFFUSION_DIR}
COPY --from=qwen-models ${VAE_DIR} ${VAE_DIR}
COPY --from=qwen-models ${CLIP_DIR} ${CLIP_DIR}
COPY --from=qwen-models ${UNET_DIR} ${UNET_DIR}
COPY --from=qwen-models ${LORA_DIR} ${LORA_DIR}

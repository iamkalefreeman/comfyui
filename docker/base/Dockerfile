ARG BASE_TAG=comfy0.3.43-api1.9.1-torch2.7.1-cuda12.6-runtime

# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM ghcr.io/saladtechnologies/comfyui-api:$BASE_TAG

# Set working directory
WORKDIR /opt/ComfyUI

# Environment variables
ENV MODEL_DIR=/opt/ComfyUI/models \
    CHECKPOINT_DIR=${MODEL_DIR}/checkpoints \
    DIFFUSION_DIR=${MODEL_DIR}/diffusion_models \
    VAE_DIR=${MODEL_DIR}/vae \
    CLIP_DIR=${MODEL_DIR}/clip \
    UNET_DIR=${MODEL_DIR}/unet \
    LORA_DIR=${MODEL_DIR}/lora \
    COMFYUI_PORT_HOST=8188 \
    STARTUP_CHECK_MAX_TRIES=30 \
    PYTHONUNBUFFERED=1

# Install system dependencies and create model directories in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Download models in parallel to reduce build time
RUN wget -O ${VAE_DIR}/ae.safetensors https://huggingface.co/Comfy-Org/Lumina_Image_2.0_Repackaged/resolve/main/split_files/vae/ae.safetensors & \
    wget -O ${CLIP_DIR}/clip_l.safetensors https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors?download=true & \
    wget -O ${CLIP_DIR}/t5xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn_scaled.safetensors?download=true & \
    wget -O ${DIFFUSION_DIR}/redKFm00NSFWEditorFP8.Wtdk.safetensors https://huggingface.co/lingo/Red-K_Kontext_DEV_NSFW/resolve/main/redKFm00NSFWEditorFP8.Wtdk.safetensors?download=true & \
    wait

RUN wget -O ${DIFFUSION_DIR}/flux1-dev-kontext_fp8_scaled.safetensors https://huggingface.co/Comfy-Org/flux1-kontext-dev_ComfyUI/resolve/main/split_files/diffusion_models/flux1-dev-kontext_fp8_scaled.safetensors?download=true

# Set permissions for model files (commented out to avoid unnecessary operation)
# RUN chmod -R 644 ${MODEL_DIR}/*.safetensors

RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    curl \
    openssh-server \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies in one layer for FP8, LoRA, and custom nodes
RUN pip install --no-cache-dir \
    torch>=2.7.1 \
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

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

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

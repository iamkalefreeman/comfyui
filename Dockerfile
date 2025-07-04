# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM ghcr.io/saladtechnologies/comfyui-api:comfy0.3.27-torch2.6.0-cuda12.4-runtime

# Set working directory
WORKDIR /opt/ComfyUI

# Environment variables
ENV MODEL_DIR=/opt/ComfyUI/models
ENV CHECKPOINT_DIR=${MODEL_DIR}/checkpoints
ENV DIFFUSION_DIR=${MODEL_DIR}/diffusion_models
ENV VAE_DIR=${MODEL_DIR}/vae
ENV CLIP_DIR=${MODEL_DIR}/clip
ENV UNET_DIR=${MODEL_DIR}/unet
ENV COMFYUI_PORT_HOST=8188
ENV STARTUP_CHECK_MAX_TRIES=30

# Install additional dependencies (if needed)
RUN apt-get update && apt-get install -y \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Clone ComfyUI repository (if not already included in the base image)
# Uncomment if the base image does not include ComfyUI
# RUN git clone https://github.com/comfyanonymous/ComfyUI.git /opt/ComfyUI
# RUN pip install -r requirements.txt

# Install ComfyUI-GGUF plugin for GGUF model support
RUN pip install git+https://github.com/comfyanonymous/ComfyUI_bitsandbytes_NF4.git

# Download Flux.1 Kontext Dev model files from Hugging Face
RUN mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} && \
    wget -O ${DIFFUSION_DIR}/flux1-dev-kontext_fp8_scaled.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/flux1-dev-kontext_fp8_scaled.safetensors && \
    wget -O ${VAE_DIR}/ae.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/ae.safetensors && \
    wget -O ${CLIP_DIR}/clip_l.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/clip_l.safetensors && \
    wget -O ${CLIP_DIR}/t5xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/t5xxl_fp8_e4m3fn_scaled.safetensors

# Optionally, download GGUF model for lower VRAM systems
# RUN wget -O ${UNET_DIR}/flux1-kontext-dev-Q3_K_S.gguf https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/flux1-kontext-dev-Q3_K_S.gguf

# Copy a sample workflow (optional, assumes you have a workflow JSON file)
# COPY workflow_api_flux_fp8.json /opt/ComfyUI/workflow_api_flux_fp8.json

# Expose the ComfyUI port
EXPOSE 8188

# Command to start ComfyUI
CMD ["python", "main.py", "--listen", "0.0.0.0", "--port", "8188"]

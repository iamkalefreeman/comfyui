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
ENV PYTHONUNBUFFERED=1

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies for FP8 support and essential plugins
RUN pip install --no-cache-dir \
    torch>=2.6.0 \
    transformers \
    bitsandbytes \
    accelerate \
    safetensors \
    huggingface_hub

# Install ComfyUI-GGUF and bitsandbytes for FP8 and NF4 support
RUN pip install git+https://github.com/comfyanonymous/ComfyUI_bitsandbytes_NF4.git

# Install essential ComfyUI plugins
RUN git clone https://github.com/ltdrdata/ComfyUI-Manager.git /opt/ComfyUI/custom_nodes/ComfyUI-Manager && \
    git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus && \
    git clone https://github.com/Kosinkadink/ComfyUI-Advanced-Control.git /opt/ComfyUI/custom_nodes/ComfyUI-Advanced-Control && \
    git clone https://github.com/Fannovel16/ComfyUI-VideoHelperSuite.git /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Advanced-Control/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt

# Download Flux.1 Kontext Dev FP8 model files from Hugging Face
RUN mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} && \
    wget -O ${DIFFUSION_DIR}/flux1-dev-kontext_fp8_scaled.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/flux1-dev-kontext_fp8_scaled.safetensors && \
    wget -O ${VAE_DIR}/ae.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/ae.safetensors && \
    wget -O ${CLIP_DIR}/clip_l.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/clip_l.safetensors && \
    wget -O ${CLIP_DIR}/t5xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/t5xxl_fp8_e4m3fn_scaled.safetensors

# Optionally, download GGUF model for lower VRAM systems
# RUN wget -O ${UNET_DIR}/flux1-kontext-dev-Q3_K_S.gguf https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/flux1-kontext-dev-Q3_K_S.gguf

# Expose the ComfyUI port
EXPOSE 8188

# Command to start ComfyUI
CMD ["python", "main.py", "--listen", "0.0.0.0", "--port", "8188", "--enable-cors-header", "--extra-model-paths-config", "/opt/ComfyUI/models"]

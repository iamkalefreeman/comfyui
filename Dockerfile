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
ENV LORA_DIR=${MODEL_DIR}/lora
ENV COMFYUI_PORT_HOST=8188
ENV STARTUP_CHECK_MAX_TRIES=30
ENV PYTHONUNBUFFERED=1

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies for FP8, LoRA, and custom nodes
RUN pip install --no-cache-dir \
    torch>=2.6.0 \
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
    peft

# Install ComfyUI-GGUF and bitsandbytes for FP8 and NF4 support
RUN pip install git+https://github.com/comfyanonymous/ComfyUI_bitsandbytes_NF4.git

# Install essential and additional custom nodes, including LoRA support
RUN mkdir -p /opt/ComfyUI/custom_nodes ${LORA_DIR} && \
    git clone https://github.com/ltdrdata/ComfyUI-Manager.git /opt/ComfyUI/custom_nodes/ComfyUI-Manager && \
    git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus && \
    git clone https://github.com/Kosinkadink/ComfyUI-Advanced-Control.git /opt/ComfyUI/custom_nodes/ComfyUI-Advanced-Control && \
    git clone https://github.com/Fannovel16/ComfyUI-VideoHelperSuite.git /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite && \
    git clone https://github.com/WASasquatch/was-node-suite-comfyui.git /opt/ComfyUI/custom_nodes/was-node-suite-comfyui && \
    git clone https://github.com/pythongosssss/ComfyUI-Custom-Scripts.git /opt/ComfyUI/custom_nodes/ComfyUI-Custom-Scripts && \
    git clone https://github.com/cubiq/ComfyUI_essentials.git /opt/ComfyUI/custom_nodes/ComfyUI_essentials && \
    git clone https://github.com/jags111/efficiency-nodes-comfyui.git /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui && \
    git clone https://github.com/Glyfnet/ComfyUI-Depth-Anything.git /opt/ComfyUI/custom_nodes/ComfyUI-Depth-Anything && \
    git clone https://github.com/ssitu/ComfyUI_UltimateSDUpscale.git /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale && \
    git clone https://github.com/kohya-ss/ComfyUI-LoRA.git /opt/ComfyUI/custom_nodes/ComfyUI-LoRA && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Advanced-Control/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/was-node-suite-comfyui/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Custom-Scripts/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI_essentials/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Depth-Anything/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale/requirements.txt && \
    pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-LoRA/requirements.txt && \
    chmod -R 755 /opt/ComfyUI/custom_nodes

# Download Flux.1 Kontext Dev FP8 model files from Hugging Face and set permissions
RUN mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR} && \
    wget -O ${DIFFUSION_DIR}/flux1-dev-kontext_fp8_scaled.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/flux1-dev-kontext_fp8_scaled.safetensors && \
    wget -O ${VAE_DIR}/ae.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/ae.safetensors && \
    wget -O ${CLIP_DIR}/clip_l.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/clip_l.safetensors && \
    wget -O ${CLIP_DIR}/t5xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/t5xxl_fp8_e4m3fn_scaled.safetensors && \
    chmod -R 644 ${MODEL_DIR}/*.safetensors && \
    chmod -R 755 ${MODEL_DIR}

# Optionally, download a sample LoRA model for Flux.1 (example LoRA, replace with desired model)
# RUN wget -O ${LORA_DIR}/example_lora.safetensors https://huggingface.co/<user>/<lora-model>/resolve/main/<lora-model>.safetensors && \
#     chmod 644 ${LORA_DIR}/*.safetensors

# Optionally, download GGUF model for lower VRAM systems
# RUN wget -O ${UNET_DIR}/flux1-kontext-dev-Q3_K_S.gguf https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/flux1-kontext-dev-Q3_K_S.gguf && \
#     chmod 644 ${UNET_DIR}/*.gguf

# Disable safety filters to allow NSFW input/output
RUN sed -i 's/safety_checker=True/safety_checker=False/' /opt/ComfyUI/main.py || echo "safety_checker not found in main.py"

# Expose the ComfyUI port
EXPOSE 8188

# Command to start ComfyUI
CMD ["python", "main.py", "--listen", "0.0.0.0", "--port", "8188", "--enable-cors-header", "--extra-model-paths-config", "/opt/ComfyUI/models", "--dont-upcast-sampling"]

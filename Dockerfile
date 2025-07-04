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

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Download Flux.1 Kontext Dev FP8 model files from Hugging Face and set permissions
RUN mkdir -p ${DIFFUSION_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR} && \
    wget -O ${DIFFUSION_DIR}/flux1-dev-kontext_fp8_scaled.safetensors https://huggingface.co/Comfy-Org/flux1-kontext-dev_ComfyUI/resolve/main/split_files/diffusion_models/flux1-dev-kontext_fp8_scaled.safetensors?download=true && \
    wget -O ${VAE_DIR}/ae.safetensors https://huggingface.co/Comfy-Org/Lumina_Image_2.0_Repackaged/resolve/main/split_files/vae/ae.safetensors && \
    wget -O ${CLIP_DIR}/clip_l.safetensors https://huggingface.co/comfyanonymous/flux_text_encoders/raw/main/clip_l.safetensors && \
    wget -O ${CLIP_DIR}/t5xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn_scaled.safetensors && \
    chmod -R 644 ${MODEL_DIR}/*.safetensors && \
    chmod -R 755 ${MODEL_DIR}

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

# Install ComfyUI-GGUF for GGUF/FP8 model support
RUN git clone https://github.com/city96/ComfyUI-GGUF.git /opt/ComfyUI/custom_nodes/ComfyUI-GGUF
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt; else echo "No requirements.txt for ComfyUI-GGUF"; fi

# Create directories for custom nodes and LoRA
RUN mkdir -p /opt/ComfyUI/custom_nodes ${LORA_DIR}

# Install custom nodes individually with requirements.txt checks
RUN git clone https://github.com/ltdrdata/ComfyUI-Manager.git /opt/ComfyUI/custom_nodes/ComfyUI-Manager
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt; else echo "No requirements.txt for ComfyUI-Manager"; fi

RUN git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus/requirements.txt; else echo "No requirements.txt for ComfyUI_IPAdapter_plus"; fi

RUN git clone https://github.com/Kosinkadink/ComfyUI-Advanced-Control.git /opt/ComfyUI/custom_nodes/ComfyUI-Advanced-Control
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Advanced-Control/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Advanced-Control/requirements.txt; else echo "No requirements.txt for ComfyUI-Advanced-Control"; fi

RUN git clone https://github.com/Fannovel16/ComfyUI-VideoHelperSuite.git /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt; else echo "No requirements.txt for ComfyUI-VideoHelperSuite"; fi

RUN git clone https://github.com/WASasquatch/was-node-suite-comfyui.git /opt/ComfyUI/custom_nodes/was-node-suite-comfyui
RUN if [ -f /opt/ComfyUI/custom_nodes/was-node-suite-comfyui/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/was-node-suite-comfyui/requirements.txt; else echo "No requirements.txt for was-node-suite-comfyui"; fi

RUN git clone https://github.com/ltdrdata/ComfyUI-Inspire-Pack.git /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack/requirements.txt; else echo "No requirements.txt for ComfyUI-Inspire-Pack"; fi

RUN git clone https://github.com/cubiq/ComfyUI_essentials.git /opt/ComfyUI/custom_nodes/ComfyUI_essentials
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_essentials/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI_essentials/requirements.txt; else echo "No requirements.txt for ComfyUI_essentials"; fi

RUN git clone https://github.com/jags111/efficiency-nodes-comfyui.git /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui
RUN if [ -f /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui/requirements.txt; else echo "No requirements.txt for efficiency-nodes-comfyui"; fi

RUN git clone https://github.com/Glyfnet/ComfyUI-Depth-Anything.git /opt/ComfyUI/custom_nodes/ComfyUI-Depth-Anything
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Depth-Anything/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Depth-Anything/requirements.txt; else echo "No requirements.txt for ComfyUI-Depth-Anything"; fi

RUN git clone https://github.com/ssitu/ComfyUI_UltimateSDUpscale.git /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale/requirements.txt; else echo "No requirements.txt for ComfyUI_UltimateSDUpscale"; fi

RUN git clone https://github.com/kohya-ss/ComfyUI-LoRA.git /opt/ComfyUI/custom_nodes/ComfyUI-LoRA
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-LoRA/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-LoRA/requirements.txt; else echo "No requirements.txt for ComfyUI-LoRA"; fi

RUN git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation.git /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation
RUN if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation/requirements.txt ]; then pip install -r /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation/requirements.txt; else echo "No requirements.txt for ComfyUI-Frame-Interpolation"; fi

# Set permissions for custom nodes
RUN chmod -R 755 /opt/ComfyUI/custom_nodes

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

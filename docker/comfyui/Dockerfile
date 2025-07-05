# Use a CUDA-enabled base image with PyTorch and necessary dependencies
FROM ghcr.io/saladtechnologies/comfyui-api:comfy0.3.43-api1.9.1-torch2.7.1-cuda12.6-runtime

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
#RUN wget -O ${DIFFUSION_DIR}/flux1-dev-kontext_fp8_scaled.safetensors https://huggingface.co/Comfy-Org/flux1-kontext-dev_ComfyUI/resolve/main/split_files/diffusion_models/flux1-dev-kontext_fp8_scaled.safetensors?download=true & \
RUN wget -O ${VAE_DIR}/ae.safetensors https://huggingface.co/Comfy-Org/Lumina_Image_2.0_Repackaged/resolve/main/split_files/vae/ae.safetensors & \
    wget -O ${CLIP_DIR}/clip_l.safetensors https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors?download=true & \
    wget -O ${CLIP_DIR}/t5xxl_fp8_e4m3fn_scaled.safetensors https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn_scaled.safetensors?download=true & \
    wget -O ${DIFFUSION_DIR}/redKFm00NSFWEditorFP8.Wtdk.safetensors https://huggingface.co/lingo/Red-K_Kontext_DEV_NSFW/resolve/main/redKFm00NSFWEditorFP8.Wtdk.safetensors?download=true & \
    wait

# Set permissions for model files (commented out to avoid unnecessary operation)
# RUN chmod -R 644 ${MODEL_DIR}/*.safetensors

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

# Install ComfyUI-GGUF and custom nodes with requirements.txt checks
RUN git clone https://github.com/city96/ComfyUI-GGUF.git /opt/ComfyUI/custom_nodes/ComfyUI-GGUF && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-GGUF/requirements.txt; else echo "No requirements.txt for ComfyUI-GGUF"; fi && \
    git clone https://github.com/Comfy-Org/ComfyUI-Manager.git /opt/ComfyUI/custom_nodes/ComfyUI-Manager && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt; else echo "No requirements.txt for ComfyUI-Manager"; fi && \
    git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_IPAdapter_plus/requirements.txt; else echo "No requirements.txt for ComfyUI_IPAdapter_plus"; fi && \
    git clone https://github.com/Fannovel16/ComfyUI-VideoHelperSuite.git /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt; else echo "No requirements.txt for ComfyUI-VideoHelperSuite"; fi && \
    git clone https://github.com/ltdrdata/was-node-suite-comfyui.git /opt/ComfyUI/custom_nodes/was-node-suite-comfyui && \
    if [ -f /opt/ComfyUI/custom_nodes/was-node-suite-comfyui/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/was-node-suite-comfyui/requirements.txt; else echo "No requirements.txt for was-node-suite-comfyui"; fi && \
    git clone https://github.com/ltdrdata/ComfyUI-Inspire-Pack.git /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-Inspire-Pack/requirements.txt; else echo "No requirements.txt for ComfyUI-Inspire-Pack"; fi && \
    git clone https://github.com/cubiq/ComfyUI_essentials.git /opt/ComfyUI/custom_nodes/ComfyUI_essentials && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_essentials/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_essentials/requirements.txt; else echo "No requirements.txt for ComfyUI_essentials"; fi && \
    git clone https://github.com/jags111/efficiency-nodes-comfyui.git /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui && \
    if [ -f /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/efficiency-nodes-comfyui/requirements.txt; else echo "No requirements.txt for efficiency-nodes-comfyui"; fi && \
    git clone https://github.com/kijai/ComfyUI-DepthAnythingV2.git /opt/ComfyUI/custom_nodes/ComfyUI-DepthAnythingV2 && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-DepthAnythingV2/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-DepthAnythingV2/requirements.txt; else echo "No requirements.txt for ComfyUI-DepthAnythingV2"; fi && \
    git clone https://github.com/ssitu/ComfyUI_UltimateSDUpscale.git /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_UltimateSDUpscale/requirements.txt; else echo "No requirements.txt for ComfyUI_UltimateSDUpscale"; fi && \
    git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation.git /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation/requirements.txt; else echo "No requirements.txt for ComfyUI-Frame-Interpolation"; fi && \
    git clone https://github.com/yolain/ComfyUI-Easy-Use.git /opt/ComfyUI/custom_nodes/ComfyUI-Easy-Use && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Easy-Use/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-Easy-Use/requirements.txt; else echo "No requirements.txt for ComfyUI-Easy-Use"; fi && \
    git clone https://github.com/TinyTerra/ComfyUI_tinyterraNodes.git /opt/ComfyUI/custom_nodes/ComfyUI_tinyterraNodes && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_tinyterraNodes/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_tinyterraNodes/requirements.txt; else echo "No requirements.txt for ComfyUI_tinyterraNodes"; fi && \
    git clone https://github.com/rgthree/rgthree-comfy.git /opt/ComfyUI/custom_nodes/rgthree-comfy && \
    if [ -f /opt/ComfyUI/custom_nodes/rgthree-comfy/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/rgthree-comfy/requirements.txt; else echo "No requirements.txt for rgthree-comfy"; fi && \
    git clone https://github.com/gseth/ControlAltAI-Nodes.git /opt/ComfyUI/custom_nodes/ControlAltAI-Nodes && \
    if [ -f /opt/ComfyUI/custom_nodes/ControlAltAI-Nodes/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ControlAltAI-Nodes/requirements.txt; else echo "No requirements.txt for ControlAltAI-Nodes"; fi && \
    git clone https://github.com/EvilBT/ComfyUI_SLK_joy_caption_two.git /opt/ComfyUI/custom_nodes/ComfyUI_SLK_joy_caption_two && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_SLK_joy_caption_two/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_SLK_joy_caption_two/requirements.txt; else echo "No requirements.txt for ComfyUI_SLK_joy_caption_two"; fi && \
    git clone https://github.com/bananasss00/ComfyUI_bitsandbytes_NF4-Lora.git /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora && \
    if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora/requirements.txt; else echo "No requirements.txt for ComfyUI_bitsandbytes_NF4-Lora"; fi && \
    chmod -R 755 /opt/ComfyUI/custom_nodes

# Optionally, download a sample LoRA model for Flux.1 (example LoRA, replace with desired model)
# RUN wget -O ${LORA_DIR}/example_lora.safetensors https://huggingface.co/<user>/<lora-model>/resolve/main/<lora-model>.safetensors && \
#     chmod 644 ${LORA_DIR}/*.safetensors

# Optionally, download GGUF model for lower VRAM systems
# RUN wget -O ${UNET_DIR}/flux1-kontext-dev-Q3_K_S.gguf https://huggingface.co/Comfy-Org/flux1-kontext-dev_ComfyUI/resolve/main/flux1-kontext-dev-Q3_K_S.gguf?download=true && \
#     chmod 644 ${UNET_DIR}/*.gguf

# Disable safety filters to allow NSFW input/output
RUN sed -i 's/safety_checker=True/safety_checker=False/' /opt/ComfyUI/main.py || echo "safety_checker not found in main.py"

RUN  mkdir -p /workflows
COPY ../../workflows /opt/ComfyUI/workflows
COPY ../../workflows /workflows

# Expose the ComfyUI port
EXPOSE 8188

# Command to start ComfyUI
CMD ["bash", "-c", "comfy --workspace /opt/ComfyUI launch -- --listen 0.0.0.0 --port 8188 --enable-cors-header"]

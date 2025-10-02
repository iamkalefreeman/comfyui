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
  
FROM $BUILDBOX_IMAGE AS qwen-models

# Environment variables
ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR

WORKDIR /
RUN set -xe && mkdir -p ${MODEL_DIR} ${DIFFUSION_DIR} ${CHECKPOINT_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Download base models
ENV ARIA2C_TMP_FILE="/tmp/downloads.txt"
COPY --chown=root:root <<EOF "${ARIA2C_TMP_FILE}"
https://huggingface.co/1038lab/RMBG-2.0/resolve/main/model.safetensors?download=true
  dir=${MODEL_DIR}/RMBG/RMBG-2.0
  out=model.safetensors

https://huggingface.co/1038lab/BiRefNet_HR/resolve/main/model.safetensors?download=true
  dir=${MODEL_DIR}/RMBG/BiRefNet-HR
  out=model.safetensors

https://huggingface.co/1038lab/segformer_clothes/resolve/main/model.safetensors?download=true
  dir=${MODEL_DIR}/RMBG/segformer_clothes
  out=model.safetensors

https://huggingface.co/1038lab/segformer_fashion/resolve/main/model.safetensors?download=true
  dir=${MODEL_DIR}/RMBG/segformer_fashion
  out=model.safetensors

https://huggingface.co/Comfy-Org/Real-ESRGAN_repackaged/resolve/main/RealESRGAN_x4plus.safetensors?download=true
  dir=${MODEL_DIR}/upscale_models
  out=RealESRGAN_x4plus.safetensors

https://huggingface.co/lokCX/4x-Ultrasharp/resolve/main/4x-UltraSharp.pth?download=true
  dir=${MODEL_DIR}/upscale_models
  out=4x-UltraSharp.pth

https://huggingface.co/Phips/4xRealWebPhoto_v4_dat2/resolve/main/4xRealWebPhoto_v4_dat2.safetensors?download=true
  dir=${MODEL_DIR}/upscale_models
  out=4xRealWebPhoto_v4_dat2.safetensors

https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth
  dir=${MODEL_DIR}/facerestore_models
  out=GFPGANv1.4.pth

https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/codeformer.pth
  dir=${MODEL_DIR}/facerestore_models
  out=codeformer.pth

https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth
  dir=${MODEL_DIR}/facedetection
  out=detection_Resnet50_Final.pth

https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_mobilenet0.25_Final.pth
  dir=${MODEL_DIR}/facedetection
  out=detection_mobilenet0.25_Final.pth

https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/yolov5l-face.pth
  dir=${MODEL_DIR}/facedetection
  out=yolov5l-face.pth

https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/yolov5n-face.pth
  dir=${MODEL_DIR}/facedetection
  out=yolov5n-face.pth
EOF
RUN set -xe && aria2c -i "${ARIA2C_TMP_FILE}" -j 4 --max-connection-per-server=10 && rm -f "${ARIA2C_TMP_FILE}"

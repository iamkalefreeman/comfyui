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
  
FROM $BUILDBOX_IMAGE AS comfyui-models

# Environment variables
ARG MODEL_DIR CHECKPOINT_DIR DIFFUSION_DIR VAE_DIR CLIP_DIR UNET_DIR LORA_DIR
ENV HF_HUB_ENABLE_HF_TRANSFER=1

WORKDIR /
RUN set -xe && mkdir -p ${MODEL_DIR} ${DIFFUSION_DIR} ${CHECKPOINT_DIR} ${VAE_DIR} ${CLIP_DIR} ${UNET_DIR} ${LORA_DIR}

# Download HF models
RUN <<EOS
set -xe
. /buildbox_env/bin/activate
python3 -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='1038lab/RMBG-2.0', local_dir='${MODEL_DIR}/RMBG/RMBG-2.0', local_dir_use_symlinks=False)"
python3 -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='1038lab/BiRefNet_HR', local_dir='${MODEL_DIR}/RMBG/BiRefNet_HR', local_dir_use_symlinks=False)"
python3 -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='1038lab/segformer_clothes', local_dir='${MODEL_DIR}/RMBG/segformer_clothes', local_dir_use_symlinks=False)"
python3 -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='1038lab/segformer_fashion', local_dir='${MODEL_DIR}/RMBG/segformer_fashion', local_dir_use_symlinks=False)"
EOS

# Download base models
COPY https://huggingface.co/Comfy-Org/Real-ESRGAN_repackaged/resolve/main/RealESRGAN_x4plus.safetensors?download=true ${MODEL_DIR}/upscale_models/RealESRGAN_x4plus.safetensors
COPY https://huggingface.co/lokCX/4x-Ultrasharp/resolve/main/4x-UltraSharp.pth?download=true ${MODEL_DIR}/upscale_models/4x-UltraSharp.pth
COPY https://huggingface.co/Phips/4xRealWebPhoto_v4_dat2/resolve/main/4xRealWebPhoto_v4_dat2.safetensors?download=true ${MODEL_DIR}/upscale_models/4xRealWebPhoto_v4_dat2.safetensors
COPY https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth ${MODEL_DIR}/facerestore_models/GFPGANv1.4.pth
COPY https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/codeformer.pth ${MODEL_DIR}/facerestore_models/codeformer.pth
COPY https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_Resnet50_Final.pth ${MODEL_DIR}/facedetection/detection_Resnet50_Final.pth
COPY https://github.com/xinntao/facexlib/releases/download/v0.1.0/detection_mobilenet0.25_Final.pth ${MODEL_DIR}/facedetection/detection_mobilenet0.25_Final.pth
COPY https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/yolov5l-face.pth ${MODEL_DIR}/facedetection/yolov5l-face.pth
COPY https://github.com/sczhou/CodeFormer/releases/download/v0.1.0/yolov5n-face.pth ${MODEL_DIR}/facedetection/yolov5n-face.pth


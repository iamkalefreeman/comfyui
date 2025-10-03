#!/bin/bash -xe

date_version=$(date +'%d-%m-%Y-%H-%M')
docker_account=${DOCKER_ACCOUNT:-YOUR_DOCKER_ACCOUNT_HERE}
working_dir=${WORKING_DIR:-"/path/to/your/comfyui/code"}

#########################
# QWEN Builds
#########################

### Build qwen-models
docker buildx build --target qwen-models \
  --build-arg BUILDBOX_IMAGE="${docker_account}/buildbox:stable" \
  -t "${docker_account}/ai-models:qwen-models-latest" "${working_dir}" \
  -f "${working_dir}/docker/ai-models/qwen-models.Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 11
# docker push "${docker_account}/ai-models:qwen-models-latest"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 11

### Build comfyui:qwen-models
docker buildx build --target comfyui-with-models \
  --build-arg BASE_IMAGE="ghcr.io/iamkalefreeman/comfyui-api:latest" \
  --build-arg MODELS_IMAGE="${docker_account}/ai-models:qwen-models-latest" \
  --build-arg COMFYUI_MODELS_IMAGE="${docker_account}/ai-models:comfyui-models-latest" \
  -t "${docker_account}/comfyui:qwen-models-latest" "${working_dir}" \
  -f "${working_dir}/docker/base/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12
# docker push "${docker_account}/comfyui:qwen-models-latest"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 12

#!bin/bash -xe
set -xe

date_version=$(date +'%d-%m-%Y-%H-%M')
docker_account=${DOCKER_ACCOUNT:-YOUR_DOCKER_ACCOUNT_HERE}
working_dir=${WORKING_DIR:-"/path/to/your/comfyui/code"}

#########################
# QWEN Builds
#########################

### Build comfyui:qwen-base
docker buildx build --target comfyui \
  --build-arg BASE_IMAGE="${docker_account}/comfyui:qwen-models-latest" \
  --build-arg MODELS_IMAGE="${docker_account}/ai-models:qwen-models-latest" \
  --build-arg COMFYUI_MODELS_IMAGE="${docker_account}/ai-models:comfyui-models-latest" \
  -t "${docker_account}/comfyui:qwen-base-latest" "${working_dir}" \
  -f "${working_dir}/docker/base/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12
docker push "${docker_account}/comfyui:qwen-base-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12

### Build comfyui:qwen-runpod
docker buildx build --target runpod \
  --build-arg BASE_IMAGE="${docker_account}/comfyui:qwen-base-latest" \
  -t "${docker_account}/comfyui:qwen-runpod-${date_version}" \
  -t "${docker_account}/comfyui:qwen-runpod-latest" "${working_dir}" \
  -f "${working_dir}/docker/runpod/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14
docker push "${docker_account}/comfyui:qwen-runpod-${date_version}"
# docker image rm "${docker_account}/comfyui:qwen-runpod-${date_version}"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14
docker push "${docker_account}/comfyui:qwen-runpod-latest"
# docker image rm "${docker_account}/comfyui:qwen-runpod-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14

### Build comfyui:qwen-full
docker buildx build --target full \
  --build-arg BASE_IMAGE="${docker_account}/comfyui:qwen-base-latest" \
  -t "${docker_account}/comfyui:qwen-full-latest" "${working_dir}" \
  -f "${working_dir}/docker/full/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 15
docker push "${docker_account}/comfyui:qwen-full-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 15

return 0

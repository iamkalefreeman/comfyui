#!/bin/bash -x

date_version=$(date +'%d-%m-%Y-%H-%M')
docker_account=${DOCKER_ACCOUNT:-YOUR_DOCKER_ACCOUNT_HERE}
working_dir=${WORKING_DIR:-"/path/to/your/comfyui/code"}

### Build kontext-models
docker buildx build --target kontext-models \
  --build-arg BUILDBOX_IMAGE="${docker_account}/buildbox:stable" \
  -t "${docker_account}/ai-models:kontext-models-latest" "${working_dir}" \
  -f "${working_dir}/docker/ai-models/kontext-models.Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 11
docker push "${docker_account}/ai-models:kontext-models-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 11

### Build comfyui-kontext:kontext-models
docker buildx build --target comfyui-with-models \
  --build-arg BASE_IMAGE="ghcr.io/iamkalefreeman/comfyui-api:latest" \
  --build-arg MODELS_IMAGE="${docker_account}/ai-models:kontext-models-latest" \
  --build-arg COMFYUI_MODELS_IMAGE="${docker_account}/ai-models:kontext-models-latest" \
  -t "${docker_account}/comfyui-kontext:kontext-models-latest" "${working_dir}" \
  -f "${working_dir}/docker/base/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12
docker push "${docker_account}/comfyui-kontext:kontext-models-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12

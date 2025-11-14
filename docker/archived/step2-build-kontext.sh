#!/bin/bash -x

date_version=$(date +'%d-%m-%Y-TT-%H-%M')
docker_account=${DOCKER_ACCOUNT:-YOUR_DOCKER_ACCOUNT_HERE}
working_dir=${WORKING_DIR:-"/path/to/your/comfyui/code"}

### Build comfyui:kontext-base
docker buildx build --target comfyui \
  --build-arg BASE_IMAGE="ghcr.io/iamkalefreeman/comfyui-api:latest" \
  --build-arg MODELS_IMAGE="${docker_account}/comfyui:kontext-models-latest" \
  --build-arg COMFYUI_MODELS_IMAGE="${docker_account}/comfyui:comfyui-models-latest" \
  -t "${docker_account}/comfyui:kontext-base-latest" "${working_dir}" \
  -f "${working_dir}/docker/base/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12
docker push "${docker_account}/comfyui:kontext-base-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12

### Build comfyui:kontext-runpod
docker buildx build --target runpod \
  --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
  -t "${docker_account}/comfyui:kontext-runpod-${date_version}" \
  -t "${docker_account}/comfyui:kontext-runpod-latest" "${working_dir}" \
  -f "${working_dir}/docker/runpod/Dockerfile"
docker push "${docker_account}/comfyui:kontext-runpod-${date_version}"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14
docker push "${docker_account}/comfyui:kontext-runpod-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14

# ### Build comfyui:kontext-full
# docker buildx build --target full \
#   --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
#   -t "${docker_account}/comfyui:kontext-full-latest" "${working_dir}" \
#   -f "${working_dir}/docker/full/Dockerfile"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 15
# docker push "${docker_account}/comfyui:kontext-full-latest"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 15

return 0

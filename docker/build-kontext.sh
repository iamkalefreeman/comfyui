#!bin/bash -xe

date_version=$(date +'%d-%m-%Y-%H-%M')
docker_account=${DOCKER_ACCOUNT:-YOUR_DOCKER_ACCOUNT_HERE}
working_dir=${WORKING_DIR:-"/path/to/your/comfyui/code"}

#########################
# Kontext-Flux Builds
#########################
docker buildx build --target comfyui-kontext --build-arg BASE_IMAGE="ghcr.io/iamkalefreeman/comfyui-api:latest" \
  -t "${docker_account}/comfyui:kontext-base-latest" "${working_dir}" \
  -f "${working_dir}/docker/base/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12
docker push "${docker_account}/comfyui:kontext-base-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12

docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
  -t "${docker_account}/comfyui:kontext-runpod-${date_version}" \
  -t "${docker_account}/comfyui:kontext-runpod-latest" "${working_dir}" \
  -f "${working_dir}/docker/runpod/Dockerfile"
docker push "${docker_account}/comfyui:kontext-runpod-${date_version}"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14
docker push "${docker_account}/comfyui:kontext-runpod-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14

docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
  -t "${docker_account}/comfyui:kontext-full-latest" "${working_dir}" \
  -f "${working_dir}/docker/full/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 15
docker push "${docker_account}/comfyui:kontext-full-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 15

return 0

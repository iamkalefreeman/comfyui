#!bin/bash -xe

date_version=$(date +'%d-%m-%Y-%H-%M')
docker_account=${DOCKER_ACCOUNT:-YOUR_DOCKER_ACCOUNT_HERE}
working_dir=${WORKING_DIR:-"/path/to/your/comfyui/code"}

#########################
# Kontext-Flux Builds
#########################
# docker buildx build --target kontext-models "${working_dir}" -f "${working_dir}/docker/base/Dockerfile"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 11

docker buildx build --target comfyui-kontext --build-arg BASE_IMAGE="ghcr.io/saladtechnologies/comfyui-api:comfy0.3.55-api1.9.2-torch2.8.0-cuda12.8-runtime" \
  -t "${docker_account}/comfyui:kontext-base-latest" "${working_dir}" \
  -f "${working_dir}/docker/base/Dockerfile"
docker push "${docker_account}/comfyui:kontext-base-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12

docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
  -t "${docker_account}/comfyui:kontext-salad-api-latest" "${working_dir}" \
  -f "${working_dir}/docker/salad-api/Dockerfile"
docker push "${docker_account}/comfyui:kontext-salad-api-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 13

docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
  -t "${docker_account}/comfyui:kontext-runpod-${date_version}" \
  -t "${docker_account}/comfyui:kontext-runpod-latest" "${working_dir}" \
  -f "${working_dir}/docker/runpod/Dockerfile"
docker push "${docker_account}/comfyui:kontext-runpod-${date_version}"
docker push "${docker_account}/comfyui:kontext-runpod-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14

docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
  -t "${docker_account}/comfyui:kontext-full-latest" "${working_dir}" \
  -f "${working_dir}/docker/full/Dockerfile"
docker push "${docker_account}/comfyui:kontext-full-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 15

#########################
# QWEN Builds
#########################
# docker buildx build --target qwen-models "${working_dir}" -f "${working_dir}/docker/base/Dockerfile"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 11

docker buildx build --target comfyui-qwen --build-arg BASE_IMAGE="ghcr.io/saladtechnologies/comfyui-api:comfy0.3.55-api1.9.2-torch2.8.0-cuda12.8-runtime" \
  -t "${docker_account}/comfyui:qwen-base-latest" "${working_dir}" \
  -f "${working_dir}/docker/base/Dockerfile"
docker push "${docker_account}/comfyui:qwen-base-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12

docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:qwen-base-latest" \
  -t "${docker_account}/comfyui:qwen-salad-api-latest" "${working_dir}" \
  -f "${working_dir}/docker/salad-api/Dockerfile"
docker push "${docker_account}/comfyui:qwen-salad-api-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 13

docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:qwen-base-latest" \
  -t "${docker_account}/comfyui:qwen-runpod-${date_version}" \
  -t "${docker_account}/comfyui:qwen-runpod-latest" "${working_dir}" \
  -f "${working_dir}/docker/runpod/Dockerfile"
docker push "${docker_account}/comfyui:qwen-runpod-${date_version}"
docker push "${docker_account}/comfyui:qwen-runpod-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14

docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:qwen-base-latest" \
  -t "${docker_account}/comfyui:qwen-full-latest" "${working_dir}" \
  -f "${working_dir}/docker/full/Dockerfile"
docker push "${docker_account}/comfyui:qwen-full-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 15


return 0

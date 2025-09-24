#!bin/bash -xe

date_version=$(date +'%d-%m-%Y-%H-%M')
docker_account=${DOCKER_ACCOUNT:-YOUR_DOCKER_ACCOUNT_HERE}
working_dir=${WORKING_DIR:-"/path/to/your/comfyui/code"}

#########################
# BuildBox Build
#########################
docker buildx build \
  -t "${docker_account}/buildbox:stable" "${working_dir}" \
  -f "${working_dir}/docker/buildbox/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 10
docker push "${docker_account}/buildbox:stable"
[[ "$?" -ne 0 ]] && echo "Error!" && return 10

#########################
# QWEN Builds
#########################
# docker buildx build --target qwen-models "${working_dir}" -f "${working_dir}/docker/base/Dockerfile"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 11

docker buildx build --target comfyui-qwen \
  --build-arg BASE_IMAGE="ghcr.io/iamkalefreeman/comfyui-api:latest" \
  --build-arg BUILDBOX_IMAGE="${docker_account}/buildbox:stable" \
  -t "${docker_account}/comfyui:qwen-base-latest" "${working_dir}" \
  -f "${working_dir}/docker/base/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12
docker push "${docker_account}/comfyui:qwen-base-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12

### No longer need qwen-salad-api-latest as base for building subsequent images
### Build qwen-salad-api
# docker buildx build 
#   --build-arg BASE_IMAGE="${docker_account}/comfyui:qwen-base-latest" \
#   --build-arg BUILDBOX_IMAGE="${docker_account}/buildbox:stable" \
#   -t "${docker_account}/comfyui:qwen-salad-api-latest" "${working_dir}" \
#   -f "${working_dir}/docker/salad-api/Dockerfile"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 13
# docker push "${docker_account}/comfyui:qwen-salad-api-latest"
## docker image rm "${docker_account}/comfyui:qwen-salad-api-latest"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 13

### Build qwen-runpod
docker buildx build \
  --build-arg BASE_IMAGE="${docker_account}/comfyui:qwen-base-latest" \
  --build-arg BUILDBOX_IMAGE="${docker_account}/buildbox:stable" \
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

### Build qwen-full
docker buildx build \
  --build-arg BASE_IMAGE="${docker_account}/comfyui:qwen-base-latest" \
  --build-arg BUILDBOX_IMAGE="${docker_account}/buildbox:stable" \
  -t "${docker_account}/comfyui:qwen-full-latest" "${working_dir}" \
  -f "${working_dir}/docker/full/Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 15
docker push "${docker_account}/comfyui:qwen-full-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 15


#########################
# Kontext-Flux Builds
#########################
# # docker buildx build --target kontext-models "${working_dir}" -f "${working_dir}/docker/base/Dockerfile"
# # [[ "$?" -ne 0 ]] && echo "Error!" && return 11

# docker buildx build --target comfyui-kontext --build-arg BASE_IMAGE="ghcr.io/iamkalefreeman/comfyui-api:latest" \
#   -t "${docker_account}/comfyui:kontext-base-latest" "${working_dir}" \
#   -f "${working_dir}/docker/base/Dockerfile"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 12
# docker push "${docker_account}/comfyui:kontext-base-latest"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 12

# docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
#   -t "${docker_account}/comfyui:kontext-salad-api-latest" "${working_dir}" \
#   -f "${working_dir}/docker/salad-api/Dockerfile"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 13
# docker push "${docker_account}/comfyui:kontext-salad-api-latest"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 13

# docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
#   -t "${docker_account}/comfyui:kontext-runpod-${date_version}" \
#   -t "${docker_account}/comfyui:kontext-runpod-latest" "${working_dir}" \
#   -f "${working_dir}/docker/runpod/Dockerfile"
# docker push "${docker_account}/comfyui:kontext-runpod-${date_version}"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 14
# docker push "${docker_account}/comfyui:kontext-runpod-latest"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 14

# docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui:kontext-base-latest" \
#   -t "${docker_account}/comfyui:kontext-full-latest" "${working_dir}" \
#   -f "${working_dir}/docker/full/Dockerfile"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 15
# docker push "${docker_account}/comfyui:kontext-full-latest"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 15

return 0

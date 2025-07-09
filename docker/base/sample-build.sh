#!bin/bash -xe

  date_version=$(date +'%d-%m-%Y-%H-%M')
  docker_account=brandnewx
  working_dir="/var/dockers/comfyui/code"

  cd ./code
  git pull
  cd ..
  docker buildx build --build-arg BASE_IMAGE="ghcr.io/saladtechnologies/comfyui-api:comfy0.3.43-api1.9.1-torch2.7.1-cuda12.6-runtime" \
    -t "${docker_account}/comfyui-kontext-flux:base-latest" "${working_dir}" \
    -f "${working_dir}/docker/base/Dockerfile"
  docker push "${docker_account}/comfyui-kontext-flux:base-latest"
  [[ "$?" -ne 0 ]] && echo "Error!" && return 11

  docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui-kontext-flux:base-latest" \
    -t "${docker_account}/comfyui-kontext-flux:salad-api-latest" "${working_dir}" \
    -f "${working_dir}/docker/salad-api/Dockerfile"
  docker push "${docker_account}/comfyui-kontext-flux:salad-api-latest"
  [[ "$?" -ne 0 ]] && echo "Error!" && return 12

  docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui-kontext-flux:salad-api-latest" \
    -t "${docker_account}/comfyui-kontext-flux:runpod-${date_version}" \
    -t "${docker_account}/comfyui-kontext-flux:runpod-latest" "${working_dir}" \
    -f "${working_dir}/docker/runpod/Dockerfile"
  docker push "${docker_account}/comfyui-kontext-flux:runpod-${date_version}"
  docker push "${docker_account}/comfyui-kontext-flux:runpod-latest"
  [[ "$?" -ne 0 ]] && echo "Error!" && return 13

  docker buildx build --build-arg BASE_IMAGE="${docker_account}/comfyui-kontext-flux:salad-api-latest" \
    -t "${docker_account}/comfyui-kontext-flux:full-latest" "${working_dir}" \
    -f "${working_dir}/docker/full/Dockerfile"
  docker push "${docker_account}/comfyui-kontext-flux:full-latest"
  [[ "$?" -ne 0 ]] && echo "Error!" && return 14

return 0

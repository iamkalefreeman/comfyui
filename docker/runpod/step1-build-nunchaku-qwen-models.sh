#!/bin/bash -x

date_version=$(date +'%d-%m-%Y-%H-%M')
docker_account=${DOCKER_ACCOUNT:-YOUR_DOCKER_ACCOUNT_HERE}
working_dir=${WORKING_DIR:-"/path/to/your/comfyui/code"}

#########################
# NUNCHAKU-QWEN Builds
#########################

### Build nunchaku-qwen-models
docker buildx build --target nunchaku-qwen-models \
  --build-arg BUILDBOX_IMAGE="${docker_account}/buildbox:stable" \
  -t "${docker_account}/comfyui:nunchaku-qwen-models-latest" "${working_dir}" \
  -f "${working_dir}/docker/ai-models/nunchaku-qwen-models.Dockerfile"
[[ "$?" -ne 0 ]] && echo "Error!" && return 11
docker push "${docker_account}/comfyui:nunchaku-qwen-models-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 11

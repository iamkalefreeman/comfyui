#!bin/bash -xe

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

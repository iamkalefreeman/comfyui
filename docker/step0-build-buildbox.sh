#!bin/bash -xe

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

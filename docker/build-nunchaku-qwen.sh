#!/bin/bash -x

date_version=$(date +'%d-%m-%Y-TT-%H-%M')
docker_account=${DOCKER_ACCOUNT:-YOUR_DOCKER_ACCOUNT_HERE}
working_dir=${WORKING_DIR:-"/path/to/your/comfyui/code"}

#########################
# NUNCHAKU-QWEN Builds
#########################

# Check if files exist
base_template_file="${working_dir}/docker/base/Dockerfile.template"
comfyui_models_template_file="${working_dir}/docker/ai-models/comfyui-models.dockerfile.template"
ai_models_template_file="${working_dir}/docker/ai-models/nunchaku-qwen-models.dockerfile.template"
[[ ! -f "$base_template_file" ]] && echo "$base_template_file file does not exist" && return 101
[[ ! -f "$comfyui_models_template_file" ]] && echo "$comfyui_models_template_file file does not exist" && return 101
[[ ! -f "$ai_models_template_file" ]] && echo "$ai_models_template_file file does not exist" && return 101
comfyui_models_template=$(< "$comfyui_models_template_file")
ai_models_template=$(< "$ai_models_template_file")
temp_dockerfile="$(mktemp).comfyui.Dockerfile"
while IFS= read -r line; do
    echo "${line//comfyui_models_template_here/$comfyui_models_template}"
    echo "${line//ai_models_template_here/$ai_models_template}"
done < "$base_template_file" > "$temp_dockerfile"

### Build comfyui:nunchaku-qwen-base
docker buildx build --target comfyui \
  --build-arg BASE_IMAGE="ghcr.io/iamkalefreeman/comfyui-api:latest" \
  --build-arg MODELS_IMAGE="${docker_account}/comfyui:nunchaku-qwen-models-latest" \
  --build-arg COMFYUI_MODELS_IMAGE="${docker_account}/comfyui:comfyui-models-latest" \
  -t "${docker_account}/comfyui:nunchaku-qwen-base-latest" "${working_dir}" \
  -f "${temp_dockerfile}"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12
docker push "${docker_account}/comfyui:nunchaku-qwen-base-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 12

### Build comfyui:nunchaku-qwen-runpod
docker buildx build --target runpod \
  --build-arg BASE_IMAGE="${docker_account}/comfyui:nunchaku-qwen-base-latest" \
  -t "${docker_account}/comfyui:nunchaku-qwen-runpod-${date_version}" \
  -t "${docker_account}/comfyui:nunchaku-qwen-runpod-latest" "${working_dir}" \
  -f "${temp_dockerfile}"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14
docker push "${docker_account}/comfyui:nunchaku-qwen-runpod-${date_version}"
# docker image rm "${docker_account}/comfyui:nunchaku-qwen-runpod-${date_version}"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14
docker push "${docker_account}/comfyui:nunchaku-qwen-runpod-latest"
# docker image rm "${docker_account}/comfyui:nunchaku-qwen-runpod-latest"
[[ "$?" -ne 0 ]] && echo "Error!" && return 14

# ### Build comfyui:nunchaku-qwen-full
# docker buildx build --target full \
#   --build-arg BASE_IMAGE="${docker_account}/comfyui:nunchaku-qwen-base-latest" \
#   -t "${docker_account}/comfyui:nunchaku-qwen-full-latest" "${working_dir}" \
#   -f "${temp_dockerfile}"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 15
# docker push "${docker_account}/comfyui:nunchaku-qwen-full-latest"
# [[ "$?" -ne 0 ]] && echo "Error!" && return 15

return 0

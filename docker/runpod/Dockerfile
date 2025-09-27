# check=skip=InvalidDefaultArgInFrom

ARG BASE_IMAGE=YOUR_DOCKER_ACCOUNT/comfyui:base-latest

FROM ${BASE_IMAGE} AS runpod

ENV RUNPOD_REQUEST_TIMEOUT=120

# Install necessary packages and Python 3.10
RUN <<EOS
set -xe
apt-get update
apt-get install -y --no-install-recommends \
  software-properties-common \
  curl \
  git \
  openssh-server \
  dumb-init
rm -rf /var/lib/apt/lists/*
EOS

# Install runpod within the virtual environment
RUN <<EOS
set -xe
pip install \
  runpod \
  comfy-cli
EOS

ADD ./docker/runpod/src /app

RUN <<EOS
set -xe
chmod -R +x /app
EOS

COPY ./api-workflows /workflows

# Install custom nodes with requirements.txt checks
RUN <<EOS
set -xe
git clone https://github.com/Comfy-Org/ComfyUI-Manager.git /opt/ComfyUI/custom_nodes/ComfyUI-Manager
git clone https://github.com/bananasss00/ComfyUI_bitsandbytes_NF4-Lora.git /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora
git clone https://github.com/MixLabPro/comfyui-mixlab-nodes.git /opt/ComfyUI/custom_nodes/comfyui-mixlab-nodes
git clone https://github.com/1038lab/ComfyUI-RMBG.git /opt/ComfyUI/custom_nodes/ComfyUI-RMBG
chmod -R 755 /opt/ComfyUI/custom_nodes
# Find and install requirements.txt
find /opt/ComfyUI/custom_nodes -name "requirements.txt" -type f -print0 | xargs -0 -I {} \
  sh -c 'echo "Installing requirements from {}" && pip install --no-cache-dir -r "{}"'
echo "Updating ComfyUI nodes..."
# sed -i 's/^security_level.*$/security_level = weak/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini'
# sed -i 's/^network_mode.*$/network_mode = public/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini'
comfy node update all
for file in /workflows/*.json; do \
  echo "Installing dependencies for: $file"; \
  comfy node install-deps --workflow=$file; \
done
comfy node update all
rm -rf /opt/ComfyUI/custom_nodes/ComfyUI-Manager
EOS

# Disable ComfyUI-Manager.
COPY --chown=root:root <<EOF "/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini"
[default]
preview_method = none
git_exe =
use_uv = True
channel_url = https://raw.githubusercontent.com/ltdrdata/ComfyUI-Manager/main
share_option = all
bypass_ssl = False
file_logging = True
component_policy = workflow
update_policy = stable-comfyui
windows_selector_event_loop_policy = False
model_download_by_agent = False
downgrade_blacklist =
security_level = normal
always_lazy_install = False
network_mode = offline
db_mode = cache
EOF

EXPOSE 8188
EXPOSE 3000

CMD         ["/app/start.sh"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

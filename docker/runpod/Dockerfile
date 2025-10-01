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

ADD ./docker/runpod/src /app

RUN <<EOS
set -xe
pip install runpod
chmod -R +x /app
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

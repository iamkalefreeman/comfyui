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
  runpod
EOS

ADD ./docker/runpod/src /app

RUN <<EOS
set -xe
chmod -R +x /app
EOS

COPY ./api-workflows /workflows

# Install custom nodes with requirements.txt and disable ComfyUI-Manager
RUN <<EOS
set -xe
for file in /workflows/*.json; do \
  echo "Installing dependencies for: $file"; \
  comfy node install-deps --workflow=$file; \
done
comfy node update all
rm -rf /opt/ComfyUI/custom_nodes/ComfyUI-Manager
( find . -type d -name ".git" && find . -name ".gitignore" && find . -name ".gitmodules" ) | xargs -d '\n' rm -rf
( find . -name "install.py" && find . -name "requirements.txt" ) | xargs -d '\n' rm -f
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

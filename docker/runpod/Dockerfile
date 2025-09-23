# check=skip=InvalidDefaultArgInFrom

ARG BASE_IMAGE=YOUR_DOCKER_ACCOUNT/comfyui:base-latest

FROM ${BASE_IMAGE}

ENV RUNPOD_REQUEST_TIMEOUT=120

# Install necessary packages and Python 3.10
RUN set -xe \
    && apt-get update && apt-get install -y --no-install-recommends \
      software-properties-common \
      curl \
      git \
      openssh-server \
      dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Install runpod within the virtual environment
RUN set -xe \
    && pip install runpod

ADD ./docker/runpod/src /app

RUN set -xe \
    && chmod -R +x /app

RUN set -xe && mkdir -p /workflows
COPY ./api-workflows /workflows


# Install custom nodes with requirements.txt checks
RUN set -xe \
    && git clone https://github.com/Comfy-Org/ComfyUI-Manager.git /opt/ComfyUI/custom_nodes/ComfyUI-Manager \
    && if [ -f /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI-Manager/requirements.txt; else echo "No requirements.txt for ComfyUI-Manager"; fi \
    && git clone https://github.com/bananasss00/ComfyUI_bitsandbytes_NF4-Lora.git /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora \
    && if [ -f /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora/requirements.txt ]; then pip install --no-cache-dir -r /opt/ComfyUI/custom_nodes/ComfyUI_bitsandbytes_NF4-Lora/requirements.txt; else echo "No requirements.txt for ComfyUI_bitsandbytes_NF4-Lora"; fi \
    && chmod -R 755 /opt/ComfyUI/custom_nodes \
    && echo "Updating ComfyUI nodes..." \
    && sed -i 's/security_level/c\security_level = weak/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini' \
    && sed -i 's/network_mode/c\network_mode = public/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini'
    && comfy node update all \
    && \
    for file in /workflows/*.json; do \
        echo "Installing dependencies for: $file"; \
        comfy node install-deps --workflow=$file || true; \
    done \
    && rm -rf /opt/ComfyUI/custom_nodes/ComfyUI-Manager \
    && sed -i 's/security_level/c\security_level = normal/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini' \
    && sed -i 's/network_mode/c\network_mode = offline/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini'

EXPOSE 8188
EXPOSE 3000

CMD         ["/app/start.sh"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]


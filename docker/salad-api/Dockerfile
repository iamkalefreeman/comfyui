# check=skip=InvalidDefaultArgInFrom

ARG BASE_IMAGE=YOUR_DOCKER_ACCOUNT/comfyui:base-latest

FROM ${BASE_IMAGE}

RUN  set -xe && mkdir -p /workflows
COPY ./api-workflows /workflows

RUN set -xe \
    && sed -i 's/security_level/c\security_level = weak/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini' \
    && sed -i 's/network_mode/c\network_mode = public/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini'
    
RUN for file in /workflows/*.json; do \
    echo "Installing dependencies for: $file"; \
    comfy node install-deps --workflow=$file || true; \
    done

RUN set -xe \
    && sed -i 's/security_level/c\security_level = normal/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini' \
    && sed -i 's/network_mode/c\network_mode = offline/g' '/opt/ComfyUI/user/default/ComfyUI-Manager/config.ini'

EXPOSE 8188
EXPOSE 3000

# Set CMD to launch the comfyui-api binary. The comfyui-api binary will launch ComfyUI as a child process.
CMD ["./comfyui-api"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

# check=skip=InvalidDefaultArgInFrom

ARG BASE_IMAGE=YOUR_DOCKER_ACCOUNT/comfyui-kontext-flux:base-latest

FROM ${BASE_IMAGE}

RUN  mkdir -p /workflows
COPY ./api-workflows /workflows

EXPOSE 8188
EXPOSE 3000

# Set CMD to launch the comfyui-api binary. The comfyui-api binary will launch ComfyUI as a child process.
CMD ["./comfyui-api"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

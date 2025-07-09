ARG BASE_IMAGE

FROM $BASE_IMAGE

RUN  mkdir -p /workflows
COPY ./api-workflows /workflows

EXPOSE 8188
EXPOSE 3000

# Set CMD to launch the comfyui-api binary. The comfyui-api binary will launch ComfyUI as a child process.
CMD ["./comfyui-api"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]

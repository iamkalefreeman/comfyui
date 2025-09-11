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

RUN set -xe \
    && echo "Updating ComfyUI nodes..." \
    && comfy node update all

RUN for file in /workflows/*.json; do \
    echo "Installing dependencies for: $file"; \
    comfy node install-deps --workflow=$file || true; \
    done

EXPOSE 8188
EXPOSE 3000

CMD         ["/app/start.sh"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]


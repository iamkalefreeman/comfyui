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

RUN  set -xe && mkdir -p /workflows
COPY ./api-workflows /workflows

EXPOSE 8188
EXPOSE 3000

CMD         ["/app/start.sh"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]


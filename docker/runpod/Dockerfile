FROM brandnewx/comfyui-kontext-flux:api-latest

ENV RUNPOD_REQUEST_TIMEOUT=120

# Install necessary packages and Python 3.10
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        software-properties-common \
        curl \
        git \
        openssh-server \
        dumb-init

# Install runpod within the virtual environment
RUN pip install runpod

ADD ./docker/runpod/src /app

RUN set -xe && \
    chmod -R +x /app

CMD         ["/app/start.sh"]
ENTRYPOINT  ["/usr/bin/dumb-init", "--"]


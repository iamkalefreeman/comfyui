##########################################################################################
# busybox stage
##########################################################################################
FROM ubuntu:noble-20250910 AS busybox
RUN set -xe \
  && apt-get update && apt-get install -yq --no-install-recommends \
    linux-headers-$(uname -r) \
    build-essential \
    software-properties-common  \
    ca-certificates \
    apt-transport-https \
    gnupg2 gnupg \
    lsb-release \
    expat \
    wget \
    curl \
    git \
    zip unzip unrar \
    xvfb \
    file \
    ncdu \
    tzdata \
    apt-utils \
    iputils-ping \
    traceroute \
    locales \
    aria2 \
  && apt-get autoremove -y \
  && apt-get clean -y \
  rm -rf /var/lib/apt/lists/*

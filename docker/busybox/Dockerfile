##########################################################################################
# busybox stage
##########################################################################################
FROM ubuntu:noble-20250910 AS busybox
RUN set -xe \
  && apt-get update && apt-get install -yq --no-install-recommends \
    software-properties-common  \
    ca-certificates \
    apt-transport-https \
    gnupg2 gnupg \
    libgomp1 \
    aria2 \
    wget \
    curl \
    git \
    zip unzip unrar \
    tzdata \
    locales \
  && apt-get autoremove -y \
  && apt-get clean -y \
  rm -rf /var/lib/apt/lists/*

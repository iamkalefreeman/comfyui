FROM ubuntu:noble-20250910 
RUN << EOS
set -xe 
apt-get update
apt-get install -yq --no-install-recommends \
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
  python3 \
  python3-pip \
  python3-venv
apt-get autoremove -y
apt-get clean -y
rm -rf /var/lib/apt/lists/*
EOS

RUN <<EOS
set -xe
mkdir -p /buildbox_env
python3 -m venv /buildbox_env
source /buildbox_env/bin/activate
pip install --no-cache-dir "huggingface_hub[cli]" "huggingface_hub[hf_transfer]"
EOS

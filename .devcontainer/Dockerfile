# Imagen base: Node 20 en Debian Bullseye
FROM node:20-bullseye

# Establecemos directorio de trabajo
WORKDIR /app



# Instalamos dependencias útiles para compilar y correr Backstage, sudo, Docker y Minikube
RUN apt-get update && apt-get install -y \
    git \
    curl \
    openssl \
    python3 \
    python3-pip \
    python3-venv \
    nano \
    build-essential \
    sudo \
    ca-certificates \
    lsb-release \
    apt-transport-https \
    conntrack \
    iptables \
    uidmap \
    && rm -rf /var/lib/apt/lists/*


# Instalar Docker (CLI y daemon)
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y docker-ce docker-ce-cli containerd.io \
    && rm -rf /var/lib/apt/lists/*

# Instalar kubectl
RUN curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl

# Instalar Helm
RUN curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Instalar kind
RUN curl -Lo /usr/local/bin/kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64 \
    && chmod +x /usr/local/bin/kind

# Instalar Minikube
RUN curl -Lo /usr/local/bin/minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-arm64 \
    && chmod +x /usr/local/bin/minikube

# Agregamos el usuario node al grupo sudo
RUN echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Creamos un entorno virtual para Python
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip3 install mkdocs-techdocs-core

# Actualizamos npm a la última versión estable (11.x en este momento)
RUN npm install -g npm@latest


# Exponemos los puertos necesarios
EXPOSE 443 80 8080 3001 7008 2375 2376 8083

# Dejamos bash como comando por defecto
CMD [ "bash" ]

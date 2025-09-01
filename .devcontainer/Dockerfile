# Imagen base: Node 20 en Debian Bullseye
FROM node:20-bullseye

# Establecemos directorio de trabajo
WORKDIR /app


# Instalamos dependencias útiles para compilar y correr Backstage y sudo
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
    && rm -rf /var/lib/apt/lists/*

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
EXPOSE 3000 443 80 8080 7007 3001 7008

# Dejamos bash como comando por defecto
CMD [ "bash" ]

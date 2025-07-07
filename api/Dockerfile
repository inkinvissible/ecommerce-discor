# api/Dockerfile

# --- Etapa 1: Build ---
# En esta etapa, instalamos TODAS las dependencias (incluidas las de desarrollo)
# para poder compilar nuestro código TypeScript.
FROM node:22.17-bookworm-slim AS builder

WORKDIR /app

# Instala OpenSSL para compatibilidad con Prisma y otras herramientas
RUN apt-get update && apt-get install -y openssl

# Copia los archivos de definición de paquetes
COPY package*.json ./

# Instala todas las dependencias
RUN npm install

# Copia todo el código fuente
COPY . .

# Genera el cliente de Prisma
RUN npx prisma generate

# Compila el código TypeScript a JavaScript en la carpeta /dist
RUN npx tsc

# --- Etapa 2: Producción ---
# Ahora creamos la imagen final, que será mucho más ligera.
FROM node:22-bookworm-slim AS production
WORKDIR /app

RUN apt-get update && apt-get install -y openssl

# Copia solo los package.json para instalar dependencias de producción
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# Copia la carpeta prisma con el schema
COPY --from=builder /app/prisma ./prisma

# Genera el cliente de Prisma DENTRO de la imagen final
# Esto asegura que todo lo necesario para Prisma esté aquí
RUN npx prisma generate

# Copia el código JavaScript compilado desde la etapa 'builder'
COPY --from=builder /app/dist ./dist
# Expone el puerto que usa tu API
EXPOSE 4000

# El comando para iniciar la aplicación ahora apunta al archivo JS compilado
CMD [ "node", "dist/index.js" ]
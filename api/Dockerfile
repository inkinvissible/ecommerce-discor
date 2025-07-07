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
FROM node:22.17-bookworm-slim AS production

WORKDIR /app

# Copia los archivos de definición de paquetes
COPY package*.json ./

# Instala SOLO las dependencias de producción
RUN npm install --only=production

# Copia el código JavaScript compilado desde la etapa 'builder'
COPY --from=builder /app/dist ./dist

# Copia el cliente de Prisma generado desde la etapa 'builder'
# Esto es crucial para que funcione en el entorno de producción
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expone el puerto que usa tu API
EXPOSE 4000

# El comando para iniciar la aplicación ahora apunta al archivo JS compilado
CMD [ "node", "dist/app.js" ]
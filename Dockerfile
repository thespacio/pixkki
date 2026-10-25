# syntax=docker/dockerfile:1

# ---------- Etapa 1: dependencias ----------
FROM node:22-alpine AS deps
WORKDIR /app

# libc6-compat: algunos paquetes nativos de Node lo necesitan en alpine
RUN apk add --no-cache libc6-compat

# No bajar navegadores de Playwright dentro de la imagen
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json package-lock.json ./
RUN npm ci

# ---------- Etapa 2: build ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Las variables NEXT_PUBLIC_* se incrustan en el bundle del cliente durante el build,
# por eso se reciben como ARG (no alcanza con pasarlas al correr el contenedor).
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Dejar solo dependencias de producción para la imagen final
RUN npm prune --omit=dev

# ---------- Etapa 3: runtime ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Correr como usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000

# Las variables de servidor (p. ej. claves de Supabase sin prefijo NEXT_PUBLIC_)
# se pasan en tiempo de ejecución con --env-file o -e, nunca dentro de la imagen.
CMD ["npm", "start"]

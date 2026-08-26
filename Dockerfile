# Production image: build Vite app and serve static output with correct MIME types + SPA fallback.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .

# Vite inlines these at build time (Kepler Mapbox tiles, backend API, chatbot LLM).
ARG VITE_MAPBOX_TOKEN=
ARG VITE_API_BASE_URL=
ARG VITE_OPENAI_API_KEY=
ARG VITE_OPENAI_API_URL=
ARG VITE_OPENAI_MODEL=
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY \
    VITE_OPENAI_API_URL=$VITE_OPENAI_API_URL \
    VITE_OPENAI_MODEL=$VITE_OPENAI_MODEL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

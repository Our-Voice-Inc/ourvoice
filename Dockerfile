# Start with a node 18 image with package info
# Installs *all* pnpm packages and runs build script
FROM node:18.12.1-alpine as workspace
WORKDIR /app
RUN npm install -g pnpm
COPY [".", "/app/"]
ENV RUN_POST=false
ADD scripts scripts
RUN pnpm install

FROM workspace as build
WORKDIR /app
ARG APP
ENV NODE_ENV=production
RUN pnpm build:${APP}

# # startup and copy the sources for APP
FROM nginx:stable-alpine as production
ARG DIR
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf         
COPY --from=build /app/apps/${DIR}/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
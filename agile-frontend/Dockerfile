# STAGE 1: Build the React App
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: Serve with Nginx
FROM nginx:stable-alpine
# Copy the built files from the first stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy our portable config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
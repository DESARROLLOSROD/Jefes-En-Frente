FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Export Expo app as static web build for container deployment
RUN npx expo export --output-dir web-build

FROM nginx:alpine
COPY --from=builder /app/web-build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# The --host flag is mandatory for Windows users to see the app in their browser
CMD ["npm", "run", "dev", "--", "--host"]
FROM node:22-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./ 

RUN npm install

COPY frontend ./frontend

WORKDIR /app/frontend

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--port", "3000", "--hostname", "0.0.0.0"]


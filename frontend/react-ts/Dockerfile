FROM node:22

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . 
EXPOSE 5173 
# expose the port that Vite uses for development
CMD ["npm", "run", "dev", "--", "--host"]
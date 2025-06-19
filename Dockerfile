FROM node:20-slim

# Cài đặt adb và python3
RUN apt-get update && apt-get install -y android-tools-adb python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Tạo thư mục app và copy code vào container
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose port
EXPOSE 3031

# Chạy server
CMD ["node", "index.js"]
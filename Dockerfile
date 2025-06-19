FROM node:20-slim

# Cài đặt adb và python3
RUN apt-get update && \
    apt-get install -y android-tools-adb    docker run -d -p 3000:3000 --name tivi-box-server --privileged -v /dev/bus/usb:/dev/bus/usb tivi-box-server && \
    rm -rf /var/lib/apt/lists/*

# Tạo thư mục app và copy code vào container
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose port
EXPOSE 3031

# Chạy server
CMD ["node", "index.js"]
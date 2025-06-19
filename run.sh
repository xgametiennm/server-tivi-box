#!/bin/bash

IMAGE_NAME="tivi-box-server"
CONTAINER_NAME="tivi-box-server"

# Build Docker image
echo "Đang build Docker image..."
docker build -t $IMAGE_NAME .

# Dừng và xóa container cũ nếu tồn tại
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Đang dừng và xóa container cũ..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Chạy container mới
echo "Đang chạy container mới..."
docker run -d -p 3031:3031 --name $CONTAINER_NAME $IMAGE_NAME

echo "Server đã chạy tại http://localhost:3031"
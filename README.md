
# 🖥️ Điều Khiển Android TV Box bằng Node.js và ADB

Hướng dẫn chi tiết cài đặt hệ thống điều khiển Android TV Box/Tivi thông qua server Node.js để:
- ✅ Phát video YouTube
- ⏹️ Dừng phát
- 🌙 Cho thiết bị vào chế độ ngủ (Sleep)

---

## 📦 1. Cài đặt ADB trên Windows

1. Tải ADB (Android Platform Tools):
   👉 https://developer.android.com/tools/releases/platform-tools

2. Giải nén vào thư mục, ví dụ: `C:\adb`

3. Thêm vào **Environment Variables > PATH**

4. Kiểm tra:
   ```bash
   adb version
   ```

---

## 📡 2. Kết nối Tivi/Box bằng ADB không dây

### Bước 1: Bật chế độ Developer trên Android TV
- Vào **Cài đặt > Giới thiệu > Nhấn 7 lần vào "Số bản dựng"**
- Bật **Developer Options**
  - ✅ Bật `USB Debugging`
  - ✅ Bật `ADB over network` (nếu có)

### Bước 2: Kết nối từ máy tính
- Tìm IP Box/Tivi trong mạng LAN, ví dụ: `192.168.1.31`
- Kết nối:
  ```bash
  adb connect 192.168.1.31
  ```

---

## cài đặt ADB trên server
https://developer.android.com/tools/releases/platform-tools

## 🛠️ 3. Tạo Node.js Server để gửi lệnh ADB

### Bước 1: Tạo project
```bash
mkdir chrome-cast-server && cd chrome-cast-server
npm init -y
npm install express
```

### Bước 2: Tạo file `index.js`
```js
const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

const TV_IP = "192.168.1.31"; // Thay bằng IP thực tế

// Phát video YouTube
app.post("/cast", (req, res) => {
  const { youtubeId } = req.body;
  if (!youtubeId) return res.status(400).json({ error: "youtubeId là bắt buộc" });

  const command = `
    adb connect ${TV_IP} &&
    adb shell am start -n com.google.android.youtube.tv/com.google.android.apps.youtube.tv.activity.ShellActivity -a android.intent.action.VIEW -d "https://www.youtube.com/watch?v=${youtubeId}"
  `;
  console.log(`▶️ Gửi lệnh ADB tới Tivi: ${command}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Lỗi ADB: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }

    console.log(`▶️ Đã gửi lệnh mở video YouTube: ${youtubeId}`);
    res.json({ message: "Đã gửi lệnh tới Tivi", stdout });
  });
});

// Dừng phát video
app.post("/stop", (req, res) => {
  const command = `adb connect ${TV_IP} && adb shell input keyevent 4`;
  exec(command, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: stderr });
    res.json({ message: "Đã gửi lệnh dừng", stdout });
  });
});

// Cho thiết bị ngủ
app.post("/sleep", (req, res) => {
  const command = `adb connect ${TV_IP} && adb shell input keyevent 26`;
  exec(command, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: stderr });
    res.json({ message: "Đã gửi lệnh sleep", stdout });
  });
});

app.listen(3000, () => {
  console.log("📡 Server ADB Cast chạy tại http://localhost:3000");
});
```

---

## 🚀 4. Chạy Server và Gửi Lệnh

### Khởi chạy server:
```bash
node index.js
```

### Gửi lệnh:
- **Phát video YouTube**
  - Endpoint: `POST http://localhost:3000/cast`
  - Body:
    ```json
    {
      "youtubeId": "dQw4w9WgXcQ"
    }
    ```

- **Dừng phát video**
  - `POST http://localhost:3000/stop`

- **Sleep (Tắt màn hình)**
  - `POST http://localhost:3000/sleep`

---

## 🔍 Ghi chú

- Tên package YouTube phổ biến:
  - `com.google.android.youtube.tv`
- Activity dùng để mở video:
  - `com.google.android.apps.youtube.tv.activity.ShellActivity`

- Nếu không tự phát video, bạn có thể thử thêm:
  ```bash
  adb shell input keyevent 23  # Nhấn nút OK
  ```

- Nếu sau khi sleep mà mất Wi-Fi thì cần cấu hình Tivi giữ Wi-Fi khi chờ (nếu hỗ trợ).

---

## 💡 Mở rộng

- Tạo lịch phát video định kỳ (cron)
- Quản lý nhiều Tivi
- Bảng điều khiển Web UI

Liên hệ nếu bạn muốn phát triển thêm 🎯

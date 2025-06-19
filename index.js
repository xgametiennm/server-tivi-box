const express = require("express");
const path = require("path");
const { exec } = require("child_process");
const cron = require("node-cron");

const app = express();
app.use(express.json());

const TV_IP = "192.168.1.31"; // IP Android Box

// Gửi lệnh ADB
function runAdbCommand(command, res, successMessage) {
  const fullCommand = `adb connect ${TV_IP} && ${command}`;
  console.log(`▶️ Gửi lệnh: ${fullCommand}`);
  exec(fullCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Lỗi ADB: ${stderr}`);
      return res.status(500).json({ error: stderr || error.message });
    }
    console.log(`✅ ${successMessage}`);
    res.json({ message: successMessage, stdout });
  });
}

// ▶️ Cast YouTube video
app.post("/api/cast", (req, res) => {
  const { youtubeId } = req.body;
  if (!youtubeId)
    return res.status(400).json({ error: "youtubeId là bắt buộc" });

  const command = `adb shell am start -n com.google.android.youtube.tv/com.google.android.apps.youtube.tv.activity.ShellActivity -a android.intent.action.VIEW -d "https://www.youtube.com/watch?v=${youtubeId}" && adb shell input keyevent 23`;
  runAdbCommand(
    command,
    res,
    `Đã gửi lệnh phát video YouTube ID: ${youtubeId}`
  );
});

app.use(express.static(path.join(__dirname, "public")));

// ⏹ Stop video (về Home)
app.post("/api/stop", (req, res) => {
  const command = `adb shell input keyevent KEYCODE_HOME`;
  runAdbCommand(command, res, "Đã dừng video và quay về màn hình chính");
});

// 🌙 Sleep (tắt màn hình)
app.post("/api/sleep", (req, res) => {
  const command = `adb shell input keyevent KEYCODE_SLEEP`;
  runAdbCommand(command, res, "Đã gửi lệnh sleep cho Tivi");
});

async function playVideo(res) {
  const remotePath = "/sdcard/Download/your_video.mp4";

  const commands = `adb shell input keyevent 26  && adb shell input keyevent 82 && adb shell am start -a android.intent.action.VIEW -d "file://${remotePath}" -t "video/mp4"
  `;
  runAdbCommand(commands, res, "Đã gửi lệnh playVideo cho Tivi");
}

app.post("/api/play", (req, res) => {
  try {
    playVideo(res);
  } catch (error) {
    console.error("❌ Lỗi khi phát video:", error);
    return res
      .status(500)
      .json({ error: "Lỗi khi phát video: " + error.message });
  }
});

app.post("/upload-and-play", (req, res) => {
  const videoPath =
    "D:/Research/Tivi-box/chrome-cast-server/public/taptheduc.mp4"; // đường dẫn local trên server
  const remotePath = "/sdcard/Download/your_video.mp4";

  const commands = `adb connect ${TV_IP} && adb push "${videoPath}" "${remotePath}" && adb shell am start -a android.intent.action.VIEW -d "file://${remotePath}" -t "video/mp4"
  `;

  exec(commands, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr });
    }
    res.json({ message: "Đã tải và phát video", stdout });
  });
});

// Lưu các cronjob đã tạo (nếu cần quản lý)
const playJobs = {};

// API tạo cronjob play video
app.post("/api/cron-play", (req, res) => {
  const { cronTime, source, jobName, type } = req.body;
  if (!cronTime || !jobName || !type) {
    return res
      .status(400)
      .json({ status: "error", message: "Thiếu cronTime, jobName hoặc type!" });
  }
  if (type === "youtube" && !source) {
    return res
      .status(400)
      .json({ status: "error", message: "Thiếu nguồn video YouTube!" });
  }
  // Nếu job đã tồn tại thì hủy job cũ
  if (playJobs[jobName]) {
    playJobs[jobName].stop();
    delete playJobs[jobName];
  }
  // Tạo cronjob mới
  try {
    const job = cron.schedule(cronTime, async () => {
      // Gọi hàm play video từ source ở đây
      await playVideo(); // Giả sử bạn có hàm playVideo để xử lý việc phát video
      // Ví dụ: playVideo(source);
    });
    playJobs[jobName] = job;
    res.json({
      status: "success",
      message: `Đã tạo cronjob [${jobName}] với lịch "${cronTime}" cho source "${source}"`,
    });
  } catch (err) {
    res
      .status(400)
      .json({ status: "error", message: "Lỗi tạo cronjob: " + err.message });
  }
});

// 🚀 Server
app.listen(3031, () => {
  console.log("📡 Server ADB Cast chạy tại http://localhost:3031");
});

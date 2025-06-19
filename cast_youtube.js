const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

const TV_IP = "192.168.1.31"; // IP Android Box

app.post("/cast", (req, res) => {
  const { youtubeId } = req.body;
  if (!youtubeId) return res.status(400).json({ error: "youtubeId là bắt buộc" });

  // const command = `adb connect ${TV_IP} && adb shell am start -a android.intent.action.VIEW -d "youtube:${youtubeId}"`;
  // const command = `adb connect ${TV_IP} && adb shell am start -a android.intent.action.VIEW -n com.google.android.youtube/com.google.android.youtube.WatchActivity -d "https://www.youtube.com/watch?v=${youtubeId}"`;
const command = `adb connect ${TV_IP} && adb shell am start -n com.google.android.youtube.tv/com.google.android.apps.youtube.tv.activity.ShellActivity -a android.intent.action.VIEW -d "https://www.youtube.com/watch?v=${youtubeId}"
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

app.listen(3031, () => {
  console.log("📡 Server ADB Cast chạy tại http://localhost:3031");
});

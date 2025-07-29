const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // <-- Added CORS

const app = express();

// Enable CORS for all routes (Optionally restrict to your local dev)
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("📂 Created uploads directory:", uploadsDir);
} else {
  console.log("📂 Uploads directory exists:", uploadsDir);
}

const upload = multer({ dest: uploadsDir });

app.use(express.static("public"));

// Log every request
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

app.post("/remove-bg", upload.single("image"), (req, res) => {
  if (!req.file) {
    console.error("❌ No file uploaded!");
    return res.status(400).send("No file uploaded.");
  }

  const inputPath = req.file.path;
  const outputPath = `${inputPath}-out.png`;

  console.log(`⚙️  Processing file: ${inputPath} -> ${outputPath}`);

  // Run rembg
  execFile("rembg", ["i", inputPath, outputPath], (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error running rembg:", err);
      console.error("stderr:", stderr);
      return res.status(500).send("Error removing background.");
    }

  console.log("✅ rembg finished successfully!");
  res.sendFile(path.resolve(outputPath), (sendErr) => {
    if (sendErr) console.error("❌ Error sending file:", sendErr);

    // Clean up
    try {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
      console.log("🗑️  Cleaned up files");
    } catch (cleanupErr) {
      console.error("⚠️ Cleanup error:", cleanupErr);
    }
  });
  });
});

// Start server with logging and error handling
const PORT = process.env.PORT || 10000;
try {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
} catch (err) {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
}

// Catch unhandled errors
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});

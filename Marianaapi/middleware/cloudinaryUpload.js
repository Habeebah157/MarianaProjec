const { cloudinary } = require("../utils/cloudinary");
const multer = require("multer");


const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    try {

      const ext = file.originalname?.split(".").pop()?.toLowerCase();
      const allowedFormats = ["mp3", "webm"];
      const format = allowedFormats.includes(ext) ? ext : "webm"; // fallback

      return {
        folder: "voice_notes",
        resource_type: "auto", // Auto-detects video/audio
        format,
        public_id: `voice-${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
      };
    } catch (err) {
      console.error("❌ Error in CloudinaryStorage params:", err);
      throw err;
    }
  },
});


const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {

    if (file.mimetype === "audio/webm" || file.mimetype === "audio/mpeg") {
      console.log("✅ Accepted file type:", file.mimetype);
      cb(null, true);
    } else {
      console.log("❌ Rejected file type:", file.mimetype);
      cb(new Error("Invalid file type"), false);
    }
  },
});
module.exports = upload;
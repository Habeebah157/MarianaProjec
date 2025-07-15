const { cloudinary } = require("../utils/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // You can make format dynamic if needed
    const format = file.originalname.split('.').pop() === 'mp3' ? 'mp3' : 'webm';
    
    return {
      folder: "voice_notes",
      resource_type: "video",
      format: format,
      public_id: `voice-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
    };
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    // Optional: validate file types
    if (file.mimetype === 'audio/webm' || file.mimetype === 'audio/mpeg') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

module.exports = upload;
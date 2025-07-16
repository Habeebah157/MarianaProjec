const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const testCloudinaryConnection = async () => {
  try {
    // Ping Cloudinary API to check if credentials are valid
    const response = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful:", response);
  } catch (err) {
    console.error("❌ Cloudinary connection failed:", err.message);
  }
};

module.exports = { cloudinary, testCloudinaryConnection };

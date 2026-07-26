import multer from 'multer';

// In-memory upload storage for streaming to Cloudinary or base64 data URI
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single('file');

export async function uploadImageToCloudinary(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;

    // Convert file buffer to base64 data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    if (cloudName && uploadPreset) {
      try {
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new URLSearchParams();
        formData.append('file', dataURI);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok && (data.secure_url || data.url)) {
          return res.json({
            success: true,
            url: data.secure_url || data.url,
            public_id: data.public_id,
          });
        }
      } catch (err) {
        console.warn('Cloudinary upload warning (using Data URI fallback):', err.message);
      }
    }

    // Fallback if no Cloudinary config or Cloudinary fetch fails: return Data URI
    return res.json({
      success: true,
      url: dataURI,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Image upload failed' });
  }
}

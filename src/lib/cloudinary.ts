const CLOUD_NAME = "dpaevcptp";
const UPLOAD_PRESET = "dpaevcptp";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
}

/** Compress image client-side before upload */
const compressImage = (file: File, maxWidth = 1080, quality = 0.75): Promise<Blob> => {
  return new Promise((resolve) => {
    // If file is small enough (<500KB), skip compression
    if (file.size < 500 * 1024) { resolve(file); return; }

    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
};

/** Get a local preview URL instantly (no upload needed) */
export const getLocalPreview = (file: File): string => URL.createObjectURL(file);

export const uploadToCloudinary = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> => {
  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  let uploadBlob: File | Blob = file;
  if (!isVideo) {
    try {
      uploadBlob = await compressImage(file);
    } catch (err) {
      console.warn("Compression failed, using original file:", err);
      uploadBlob = file;
    }
  }

  const formData = new FormData();
  // Provide a filename to avoid issues with some servers/apis
  formData.append("file", uploadBlob, isVideo ? "video.mp4" : "image.jpg");
  formData.append("upload_preset", UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error("Cloudinary response parse failed"));
        }
      } else {
        const errorData = xhr.responseText;
        console.error("Cloudinary error response:", errorData);
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.statusText}. Response: ${errorData}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload. Please check your connection or Cloudinary settings."));
    xhr.ontimeout = () => reject(new Error("Network timeout during upload. The file might be too large."));
    xhr.send(formData);
  });
};

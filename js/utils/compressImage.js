import { renderPopup } from '/js/components/popup.js';

async function compressImage(file) {
  // check if file size is more than 5MB
  if (file.size > 5 * 1024 * 1024) {
    return renderPopup('⚠️ 5MB only images are allowed.', 2000);
  }

  const options = {
    maxSizeMB: 1, // 1MB
    maxWidthOrHeight: 600,
    useWebWorker: true,
    fileType: 'image/webp', // WebP format
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // console.log('Original file (KB):', file.size / 1024);
    // console.log('Compressed size (KB):', compressedFile.size / 1024);

    if (compressedFile.size > file.size) {
      console.log('Compression failed. Using the original file.');
      return file;
    }

    return compressedFile;
  } catch (error) {
    renderPopup('⚠️ Error compressing the image. Try reloading the page.', 1500);
  }
}

export { compressImage };

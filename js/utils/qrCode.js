async function generateQR(link) {
  // Generate QR code
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(link, {width: 200, margin: 1}, (error, image) => {
      if (error) {
        console.error("Error generating QR code:", error);
        reject(error);
      } else {
        resolve(image);
      }
    });
  });
}

export { generateQR };

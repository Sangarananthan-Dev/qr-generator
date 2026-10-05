import QRCode from "qrcode";

/**
 * Generates a high-quality QR code on a canvas with an optional rounded center logo badge.
 * Logic matches Midfin360 QR generator with aspect ratio safety and custom options.
 *
 * @param {HTMLCanvasElement} canvas - Target canvas element
 * @param {string} textOrUrl - The destination URL or string to encode
 * @param {Object} options - Customization options
 * @returns {Promise<string>} Data URL of the generated QR code PNG
 */
export const generateQRCode = async (
  canvas,
  textOrUrl,
  options = {}
) => {
  if (!textOrUrl || !textOrUrl.trim()) {
    throw new Error("Text or URL is required to generate QR code");
  }

  const {
    logoUrl = null,
    width = 512,
    margin = 2,
    errorCorrectionLevel = "H",
    darkColor = "#000000",
    lightColor = "#FFFFFF",
    logoPadding = 20,
    badgeRadius = 25,
    logoRadius = 20,
  } = options;

  await QRCode.toCanvas(canvas, textOrUrl.trim(), {
    errorCorrectionLevel: errorCorrectionLevel,
    width: width,
    margin: margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });

  if (logoUrl) {
    await addLogoToCanvas(canvas, logoUrl, {
      logoPadding,
      badgeRadius,
      logoRadius,
      badgeBgColor: lightColor,
    });
  }

  return canvas.toDataURL("image/png");
};

/**
 * Adds a rounded badge with centered, rounded logo to the canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} logoUrl - Image URL, Data URL (base64), or Blob URL
 * @param {Object} opts
 * @returns {Promise<void>}
 */
export const addLogoToCanvas = async (canvas, logoUrl, opts = {}) => {
  const {
    logoPadding = 20,
    badgeRadius = 25,
    logoRadius = 20,
    badgeBgColor = "#FFFFFF",
  } = opts;

  const ctx = canvas.getContext("2d");
  const qrSize = canvas.width;

  const logo = new Image();
  // If not data URL, set crossOrigin to avoid canvas tainting
  if (!logoUrl.startsWith("data:") && !logoUrl.startsWith("blob:")) {
    logo.crossOrigin = "anonymous";
  }

  return new Promise((resolve) => {
    logo.onload = () => {
      const logoSize = Math.floor(qrSize / 4);
      const x = (qrSize - logoSize) / 2;
      const y = (qrSize - logoSize) / 2;
      const bgSize = logoSize + logoPadding;
      const bgX = (qrSize - bgSize) / 2;
      const bgY = (qrSize - bgSize) / 2;

      // Draw rounded background badge behind logo
      ctx.fillStyle = badgeBgColor;
      ctx.beginPath();
      ctx.moveTo(bgX + badgeRadius, bgY);
      ctx.lineTo(bgX + bgSize - badgeRadius, bgY);
      ctx.quadraticCurveTo(bgX + bgSize, bgY, bgX + bgSize, bgY + badgeRadius);
      ctx.lineTo(bgX + bgSize, bgY + bgSize - badgeRadius);
      ctx.quadraticCurveTo(
        bgX + bgSize,
        bgY + bgSize,
        bgX + bgSize - badgeRadius,
        bgY + bgSize
      );
      ctx.lineTo(bgX + badgeRadius, bgY + bgSize);
      ctx.quadraticCurveTo(bgX, bgY + bgSize, bgX, bgY + bgSize - badgeRadius);
      ctx.lineTo(bgX, bgY + badgeRadius);
      ctx.quadraticCurveTo(bgX, bgY, bgX + badgeRadius, bgY);
      ctx.closePath();
      ctx.fill();

      // Clip logo with rounded corners
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + logoRadius, y);
      ctx.lineTo(x + logoSize - logoRadius, y);
      ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + logoRadius);
      ctx.lineTo(x + logoSize, y + logoSize - logoRadius);
      ctx.quadraticCurveTo(
        x + logoSize,
        y + logoSize,
        x + logoSize - logoRadius,
        y + logoSize
      );
      ctx.lineTo(x + logoRadius, y + logoSize);
      ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - logoRadius);
      ctx.lineTo(x, y + logoRadius);
      ctx.quadraticCurveTo(x, y, x + logoRadius, y);
      ctx.closePath();
      ctx.clip();

      // Aspect ratio calculation to avoid stretching non-square logos
      const naturalWidth = logo.naturalWidth || logo.width || 1;
      const naturalHeight = logo.naturalHeight || logo.height || 1;
      const imgAspect = naturalWidth / naturalHeight;

      let drawW = logoSize;
      let drawH = logoSize;
      let drawX = x;
      let drawY = y;

      if (imgAspect > 1.1) {
        // Landscape / wide logo
        drawH = Math.round(logoSize / imgAspect);
        drawY = Math.round(y + (logoSize - drawH) / 2);
      } else if (imgAspect < 0.9) {
        // Portrait / tall logo
        drawW = Math.round(logoSize * imgAspect);
        drawX = Math.round(x + (logoSize - drawW) / 2);
      }

      ctx.drawImage(logo, drawX, drawY, drawW, drawH);
      ctx.restore();

      resolve();
    };

    logo.onerror = (err) => {
      console.warn("Could not load logo image for QR overlay:", err);
      // Resolve anyway so QR code renders even if logo fails
      resolve();
    };

    logo.src = logoUrl;
  });
};

/**
 * Downloads a data URL as an image file.
 *
 * @param {string} dataUrl
 * @param {string} filename
 */
export const downloadQRCode = (dataUrl, filename = "qr-code.png") => {
  if (!dataUrl) {
    throw new Error("Data URL is required to download");
  }

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

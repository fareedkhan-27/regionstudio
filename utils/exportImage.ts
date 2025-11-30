
export interface ExportOptions {
  format: 'png' | 'jpeg';
  filename: string;
  backgroundColor: string; // 'transparent' or hex
  title?: string;
  subtitle?: string;
  darkMode: boolean;
}

/**
 * Exports an SVG element to a PNG or JPG file with optional overlays.
 */
export const exportSvgAsImage = (
  svgElement: SVGSVGElement,
  options: ExportOptions
) => {
  if (!svgElement) return;

  const { format, filename, backgroundColor, title, subtitle, darkMode } = options;

  // 1. Serialize SVG to String
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  // Hack: If we are in dark mode, the SVG might rely on CSS variables or classes.
  // We explicitly inline some styles if needed, or rely on the canvas background.
  // For this implementation, the SVG props handle the colors, so standard serialization works.

  // 2. Create an Image wrapper
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    // 3. Setup High-Res Canvas
    const canvas = document.createElement('canvas');
    // High res width
    const targetWidth = 2400; 
    const viewBox = svgElement.viewBox.baseVal;
    const aspectRatio = viewBox.width / viewBox.height;
    
    // Calculate height based on aspect ratio + padding for text if needed
    let mapHeight = targetWidth / aspectRatio;
    
    // Extra space for title/subtitle
    const headerHeight = (title || subtitle) ? 200 : 0;
    const totalHeight = mapHeight + headerHeight;

    canvas.width = targetWidth;
    canvas.height = totalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 4. Background
    if (backgroundColor === 'transparent' && format === 'png') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = backgroundColor === 'transparent' ? '#ffffff' : backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 5. Draw Title and Subtitle
    if (title || subtitle) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const textColor = (darkMode && backgroundColor !== '#ffffff' && backgroundColor !== 'transparent') ? '#ffffff' : '#1f2937';

      let currentY = 40;

      if (title) {
        ctx.font = 'bold 64px sans-serif';
        ctx.fillStyle = textColor;
        ctx.fillText(title, canvas.width / 2, currentY);
        currentY += 80;
      }

      if (subtitle) {
        ctx.font = '40px sans-serif';
        ctx.fillStyle = textColor; // lighter gray?
        ctx.globalAlpha = 0.8;
        ctx.fillText(subtitle, canvas.width / 2, currentY);
        ctx.globalAlpha = 1.0;
      }
    }

    // 6. Draw Map
    // Center the map vertically in the remaining space or below header
    const mapY = headerHeight;
    ctx.drawImage(img, 0, mapY, targetWidth, mapHeight);

    // 7. Trigger Download
    const dataUrl = canvas.toDataURL(`image/${format}`, 0.9);
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
  };

  img.src = url;
};

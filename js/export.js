/**
 * STAMP-CAMERA - Módulo de Exportação de Fotografias
 * Gera imagem de alta fidelidade nos formatos JPG, PNG e WebP
 * preservando o arquivo original do usuário intacto.
 */

/**
 * Exporta o canvas e inicia o download da imagem carimbada
 * @param {HTMLCanvasElement} canvas
 * @param {string} originalFilename
 * @param {'image/jpeg'|'image/png'|'image/webp'} mimeType
 * @param {number} quality (0.1 a 1.0, padrao 1.0 sem perda)
 * @returns {Promise<string>} Nome do arquivo gerado
 */
export async function exportStampedPhoto(canvas, originalFilename = 'fotografia.jpg', mimeType = 'image/jpeg', quality = 1.0) {
  if (!canvas) {
    throw new Error('Canvas não fornecido para exportação');
  }

  // Define extensão conforme o formato
  let ext = 'jpg';
  if (mimeType === 'image/png') ext = 'png';
  if (mimeType === 'image/webp') ext = 'webp';

  // Extrai nome base sem extensão
  const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
  const targetFilename = `${baseName}_stamp.${ext}`;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao gerar arquivo de imagem'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = targetFilename;
        document.body.appendChild(a);
        a.click();

        // Limpeza de memória
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve(targetFilename);
        }, 100);
      },
      mimeType,
      quality
    );
  });
}

/**
 * STAMP-CAMERA - Stamp Engine (Motor de Renderização do Carimbo)
 * Motor Canvas 2D independente da interface.
 * Calcula posições, formata textos, desenha caixas com cantos arredondados,
 * sombras, bordas e renderiza tanto para preview interativo quanto para exportação 1:1.
 */

import { STAMP_POSITIONS } from './config.js';

export class StampEngine {
  constructor() {
    this.lastBounds = null; // Guarda os limites do carimbo no último render (para drag-and-drop)
  }

  /**
   * Renderiza a imagem e o carimbo em um canvas de destino
   * @param {HTMLCanvasElement} targetCanvas - Canvas onde será desenhado
   * @param {HTMLCanvasElement|HTMLImageElement} sourceImage - Imagem base
   * @param {Array<{label: string, value: string, showLabel: boolean, isCustom: boolean}>} lines - Linhas do carimbo
   * @param {Object} settings - Configurações visuais do carimbo
   * @param {boolean} isExport - Se for verdadeiro, renderiza com resolução nativa máxima
   * @returns {{x: number, y: number, width: number, height: number}} Dimensões do carimbo renderizado
   */
  render(targetCanvas, sourceImage, lines, settings, isExport = false) {
    if (!targetCanvas || !sourceImage) return null;

    const ctx = targetCanvas.getContext('2d');
    const imgWidth = sourceImage.width;
    const imgHeight = sourceImage.height;

    // Ajusta o tamanho do targetCanvas
    if (targetCanvas.width !== imgWidth || targetCanvas.height !== imgHeight) {
      targetCanvas.width = imgWidth;
      targetCanvas.height = imgHeight;
    }

    // 1. Desenha a fotografia original
    ctx.clearRect(0, 0, imgWidth, imgHeight);
    ctx.drawImage(sourceImage, 0, 0, imgWidth, imgHeight);

    // Se não houver linhas ativas, nada mais a desenhar
    const activeLines = lines.filter(l => l && (l.value !== '' && l.value !== null && l.value !== undefined));
    if (activeLines.length === 0) {
      this.lastBounds = null;
      return null;
    }

    // 2. Calcula tipografia e escalas baseadas nas dimensões da imagem
    // Para manter consistência visual independente da resolução original (ex: 12MP vs 2MP)
    const baseDimension = Math.min(imgWidth, imgHeight);
    const scaleFactor = baseDimension / 1080; // Normalizado para referência Full HD 1080p

    const fontSizePx = Math.max(14, Math.round((settings.fontSize || 22) * scaleFactor * (settings.fontSizeScale || 1.0)));
    const lineHeightPx = Math.round(fontSizePx * (settings.lineHeight || 1.35));
    const paddingPx = Math.max(8, Math.round((settings.padding || 16) * scaleFactor));
    const borderRadiusPx = Math.round((settings.borderRadius || 8) * scaleFactor);
    const borderWidthPx = Math.round((settings.borderWidth || 0) * scaleFactor);

    // Configuração de fonte no context para medição
    const fontStyle = settings.isItalic ? 'italic' : 'normal';
    const fontWeight = settings.fontWeight || '600';
    const fontFamily = settings.fontFamily || 'Inter, system-ui, sans-serif';
    ctx.font = `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`;

    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${(settings.letterSpacing || 0.5) * scaleFactor}px`;
    }

    // 3. Formata e mede as linhas de texto
    const renderedRows = [];
    let maxContentWidth = 0;

    for (const item of activeLines) {
      let text = '';
      if (item.showLabel && item.label) {
        text = `${item.label}: ${item.value}`;
      } else {
        text = `${item.value}`;
      }

      // Suporte a quebra de linha interna dentro do valor
      const subLines = text.split('\n');
      for (const sub of subLines) {
        const trimmed = sub.trim();
        if (trimmed) {
          const metrics = ctx.measureText(trimmed);
          const w = metrics.width;
          if (w > maxContentWidth) maxContentWidth = w;
          renderedRows.push({ text: trimmed, width: w });
        }
      }
    }

    if (renderedRows.length === 0) {
      this.lastBounds = null;
      return null;
    }

    const boxWidth = Math.round(maxContentWidth + (paddingPx * 2));
    const boxHeight = Math.round((renderedRows.length * lineHeightPx) + (paddingPx * 2) - (lineHeightPx - fontSizePx) + 4);

    // 4. Calcula posicionamento (X, Y)
    const marginX = Math.round((imgWidth * (settings.marginPercentX || 2.5)) / 100);
    const marginY = Math.round((imgHeight * (settings.marginPercentY || 2.5)) / 100);

    let posX = marginX;
    let posY = imgHeight - boxHeight - marginY;

    // Se estiver em modo de posição livre personalizado (drag-and-drop)
    if (settings.position === STAMP_POSITIONS.CUSTOM && settings.customPosX !== null && settings.customPosY !== null) {
      posX = Math.round(settings.customPosX * imgWidth);
      posY = Math.round(settings.customPosY * imgHeight);
    } else {
      switch (settings.position) {
        case STAMP_POSITIONS.TOP_LEFT:
          posX = marginX;
          posY = marginY;
          break;
        case STAMP_POSITIONS.TOP_CENTER:
          posX = Math.round((imgWidth - boxWidth) / 2);
          posY = marginY;
          break;
        case STAMP_POSITIONS.TOP_RIGHT:
          posX = imgWidth - boxWidth - marginX;
          posY = marginY;
          break;
        case STAMP_POSITIONS.CENTER_LEFT:
          posX = marginX;
          posY = Math.round((imgHeight - boxHeight) / 2);
          break;
        case STAMP_POSITIONS.CENTER:
          posX = Math.round((imgWidth - boxWidth) / 2);
          posY = Math.round((imgHeight - boxHeight) / 2);
          break;
        case STAMP_POSITIONS.CENTER_RIGHT:
          posX = imgWidth - boxWidth - marginX;
          posY = Math.round((imgHeight - boxHeight) / 2);
          break;
        case STAMP_POSITIONS.BOTTOM_LEFT:
          posX = marginX;
          posY = imgHeight - boxHeight - marginY;
          break;
        case STAMP_POSITIONS.BOTTOM_CENTER:
          posX = Math.round((imgWidth - boxWidth) / 2);
          posY = imgHeight - boxHeight - marginY;
          break;
        case STAMP_POSITIONS.BOTTOM_RIGHT:
          posX = imgWidth - boxWidth - marginX;
          posY = imgHeight - boxHeight - marginY;
          break;
      }
    }

    // Trava para evitar que o carimbo saia completamente da tela
    posX = Math.max(0, Math.min(imgWidth - boxWidth, posX));
    posY = Math.max(0, Math.min(imgHeight - boxHeight, posY));

    // Salva os limites para cálculo de clique e arraste
    this.lastBounds = {
      x: posX,
      y: posY,
      width: boxWidth,
      height: boxHeight,
      canvasWidth: imgWidth,
      canvasHeight: imgHeight
    };

    // 5. Desenha o fundo da caixa (Background)
    ctx.save();

    if (settings.hasShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = Math.round(12 * scaleFactor);
      ctx.shadowOffsetX = Math.round(2 * scaleFactor);
      ctx.shadowOffsetY = Math.round(4 * scaleFactor);
    }

    if (settings.backgroundType !== 'none') {
      const opacity = settings.backgroundType === 'solid' ? 1.0 : (settings.backgroundOpacity || 85) / 100;
      ctx.fillStyle = hexToRgba(settings.backgroundColor || '#0F172A', opacity);
      drawRoundedRect(ctx, posX, posY, boxWidth, boxHeight, borderRadiusPx);
      ctx.fill();

      // Borda se configurada
      if (borderWidthPx > 0 && settings.borderColor) {
        ctx.shadowColor = 'transparent'; // Evita sombra dupla na borda
        ctx.lineWidth = borderWidthPx;
        ctx.strokeStyle = settings.borderColor;
        ctx.stroke();
      }
    }

    ctx.restore();

    // 6. Desenha os textos
    ctx.save();
    ctx.font = `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`;
    ctx.fillStyle = settings.textColor || '#FFFFFF';

    if (settings.hasShadow && settings.backgroundType === 'none') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = Math.round(6 * scaleFactor);
      ctx.shadowOffsetX = Math.round(2 * scaleFactor);
      ctx.shadowOffsetY = Math.round(2 * scaleFactor);
    }

    let textStartY = posY + paddingPx + fontSizePx;
    const textAlign = settings.textAlign || 'left';

    for (let i = 0; i < renderedRows.length; i++) {
      const row = renderedRows[i];
      let rowX = posX + paddingPx;

      if (textAlign === 'center') {
        rowX = posX + (boxWidth / 2) - (row.width / 2);
      } else if (textAlign === 'right') {
        rowX = posX + boxWidth - paddingPx - row.width;
      }

      ctx.fillText(row.text, rowX, textStartY + (i * lineHeightPx));
    }

    ctx.restore();

    return this.lastBounds;
  }

  /**
   * Verifica se uma coordenada (x, y) em espaço do canvas está dentro do carimbo
   * @param {number} canvasX
   * @param {number} canvasY
   * @returns {boolean}
   */
  isPointInsideStamp(canvasX, canvasY) {
    if (!this.lastBounds) return false;
    const { x, y, width, height } = this.lastBounds;
    return (
      canvasX >= x &&
      canvasX <= x + width &&
      canvasY >= y &&
      canvasY <= y + height
    );
  }
}

/**
 * Utilitário para desenhar retângulos com cantos arredondados
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    // Fallback para navegadores sem roundRect nativo
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Converte cor hex (#RRGGBB) para rgba(r, g, b, a)
 */
function hexToRgba(hex, alpha = 1.0) {
  if (!hex || typeof hex !== 'string') return `rgba(15, 23, 42, ${alpha})`;
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return `rgba(15, 23, 42, ${alpha})`;

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * STAMP-CAMERA - Stamp Engine (Motor de Renderização do Carimbo)
 * Motor Canvas 2D independente da interface.
 * Calcula posições, formata textos, desenha caixas com cantos arredondados,
 * sombras, bordas e renderiza tanto para preview interativo quanto para exportação 1:1.
 */

import { STAMP_POSITIONS, LINE_ART_PATHS, EMOJI_TO_LINE_ART } from './config.js';

function resolveIconKey(id, icon) {
  if (icon && LINE_ART_PATHS[icon]) return icon;
  if (icon && EMOJI_TO_LINE_ART[icon]) return EMOJI_TO_LINE_ART[icon];
  if (id && LINE_ART_PATHS[id]) return id;
  return 'default';
}

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
    const fontSpec = `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}, "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.font = fontSpec;

    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${(settings.letterSpacing || 0.5) * scaleFactor}px`;
    }

    // 3. Formata e mede as linhas com suporte a ícones line art vetorizados e layouts
    const renderedRows = [];
    let maxContentWidth = 0;

    const labelMode = settings.labelMode || 'icons';
    const isSingleLine = settings.inlineLayout === 'single_line';
    const canUsePath2D = typeof Path2D !== 'undefined';

    if (isSingleLine) {
      // Modo linha única contínua com ícones line-art
      const segments = [];
      const separator = settings.inlineSeparator || '  •  ';
      const sepWidth = ctx.measureText(separator).width;
      let totalWidth = 0;

      for (let sIdx = 0; sIdx < activeLines.length; sIdx++) {
        const item = activeLines[sIdx];
        const valText = String(item.value || '').trim();
        if (!valText) continue;

        let iconKey = null;
        let text = valText;

        if (labelMode === 'icons') {
          iconKey = resolveIconKey(item.id, item.icon);
        } else if (labelMode === 'text') {
          if (item.showLabel && item.label) {
            text = `${item.label}: ${valText}`;
          }
        }

        const iconSize = iconKey ? Math.round(fontSizePx * 0.95) : 0;
        const iconGap = iconKey ? Math.round(fontSizePx * 0.45) : 0;
        const textWidth = ctx.measureText(text).width;
        const segWidth = (iconKey ? iconSize + iconGap : 0) + textWidth;

        segments.push({
          iconKey,
          text,
          iconSize,
          iconGap,
          textWidth,
          width: segWidth,
          isLast: false
        });
      }

      if (segments.length > 0) {
        segments[segments.length - 1].isLast = true;
        for (let s = 0; s < segments.length; s++) {
          totalWidth += segments[s].width;
          if (!segments[s].isLast) {
            totalWidth += sepWidth;
          }
        }
        maxContentWidth = totalWidth;
        renderedRows.push({
          isSingleLine: true,
          segments,
          separator,
          sepWidth,
          width: totalWidth
        });
      }
    } else {
      // Modo multilinhas com ícones line-art verticais
      for (const item of activeLines) {
        const valText = String(item.value || '').trim();
        if (!valText) continue;

        let iconKey = null;
        let displayText = valText;

        if (labelMode === 'icons') {
          iconKey = resolveIconKey(item.id, item.icon);
        } else if (labelMode === 'text') {
          if (item.showLabel && item.label) {
            displayText = `${item.label}: ${valText}`;
          }
        }

        // Suporte a quebra de linha interna dentro do valor
        const subLines = displayText.split('\n');
        for (let slIdx = 0; slIdx < subLines.length; slIdx++) {
          const sub = subLines[slIdx].trim();
          if (sub) {
            const rowIconKey = (slIdx === 0) ? iconKey : null;
            const iconSize = rowIconKey ? Math.round(fontSizePx * 0.95) : 0;
            const iconGap = rowIconKey ? Math.round(fontSizePx * 0.45) : 0;
            const textMetrics = ctx.measureText(sub);
            const w = (rowIconKey ? iconSize + iconGap : 0) + textMetrics.width;
            if (w > maxContentWidth) maxContentWidth = w;
            renderedRows.push({
              isSingleLine: false,
              iconKey: rowIconKey,
              text: sub,
              iconSize,
              iconGap,
              width: w
            });
          }
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

    // 6. Desenha os textos e ícones line-art com renderização precisa
    ctx.save();
    ctx.font = fontSpec;
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

      const rowY = textStartY + (i * lineHeightPx);

      if (row.isSingleLine && row.segments) {
        let curX = rowX;
        for (const seg of row.segments) {
          if (seg.iconKey && LINE_ART_PATHS[seg.iconKey] && canUsePath2D) {
            const iconSize = seg.iconSize;
            const iconScale = iconSize / 24;
            const iconY = rowY - fontSizePx + Math.round((fontSizePx - iconSize) / 2);

            ctx.save();
            ctx.translate(curX, iconY);
            ctx.scale(iconScale, iconScale);
            ctx.lineWidth = 1.75;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = settings.textColor || '#FFFFFF';
            ctx.stroke(new Path2D(LINE_ART_PATHS[seg.iconKey]));
            ctx.restore();

            curX += iconSize + seg.iconGap;
          }

          ctx.fillText(seg.text, curX, rowY);
          curX += ctx.measureText(seg.text).width;

          if (!seg.isLast) {
            ctx.fillText(row.separator, curX, rowY);
            curX += row.sepWidth;
          }
        }
      } else {
        let curX = rowX;
        if (row.iconKey && LINE_ART_PATHS[row.iconKey] && canUsePath2D) {
          const iconSize = row.iconSize;
          const iconScale = iconSize / 24;
          const iconY = rowY - fontSizePx + Math.round((fontSizePx - iconSize) / 2);

          ctx.save();
          ctx.translate(curX, iconY);
          ctx.scale(iconScale, iconScale);
          ctx.lineWidth = 1.75;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = settings.textColor || '#FFFFFF';
          ctx.stroke(new Path2D(LINE_ART_PATHS[row.iconKey]));
          ctx.restore();

          curX += iconSize + row.iconGap;
        }

        ctx.fillText(row.text, curX, rowY);
      }
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

/**
 * STAMP-CAMERA - Gerador de Arquivos ZIP 100% Client-Side
 * Implementação padrão PKWare ZIP compatível com Windows, macOS, Linux e dispositivos móveis.
 * Zero dependências externas, executa 100% localmente no navegador ou offline.
 */

export class ZipWriter {
  constructor() {
    this.files = [];
  }

  /**
   * Tabela CRC-32 calculada dinamicamente
   */
  static get crcTable() {
    if (!ZipWriter._crcTable) {
      const table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
          c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c >>> 0;
      }
      ZipWriter._crcTable = table;
    }
    return ZipWriter._crcTable;
  }

  /**
   * Calcula o hash CRC-32 de um buffer
   * @param {Uint8Array} buffer
   * @returns {number}
   */
  static crc32(buffer) {
    const table = ZipWriter.crcTable;
    let crc = 0 ^ (-1);
    for (let i = 0; i < buffer.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  /**
   * Adiciona um arquivo ao arquivo ZIP
   * @param {string} filename Nome do arquivo dentro do zip
   * @param {Uint8Array|ArrayBuffer|Blob|string} data Conteúdo do arquivo
   */
  async addFile(filename, data) {
    let uint8;
    if (data instanceof Uint8Array) {
      uint8 = data;
    } else if (data instanceof ArrayBuffer) {
      uint8 = new Uint8Array(data);
    } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
      const buf = await data.arrayBuffer();
      uint8 = new Uint8Array(buf);
    } else if (typeof data === 'string') {
      uint8 = new TextEncoder().encode(data);
    } else {
      throw new Error('Tipo de dado não suportado para arquivo ZIP');
    }

    const now = new Date();
    // Formato MS-DOS Time: bits 15-11 hora, 10-5 min, 4-0 seg/2
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (Math.floor(now.getSeconds() / 2));
    // Formato MS-DOS Date: bits 15-9 ano-1980, 8-5 mes, 4-0 dia
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    this.files.push({
      name: filename,
      data: uint8,
      crc: ZipWriter.crc32(uint8),
      dosTime,
      dosDate
    });
  }

  /**
   * Gera o Uint8Array contendo todo o arquivo ZIP estruturado
   * @returns {Uint8Array}
   */
  generateUint8Array() {
    const encoder = new TextEncoder();
    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    for (const f of this.files) {
      const nameBytes = encoder.encode(f.name);
      const size = f.data.length;
      const crc = f.crc;

      // Local file header (30 bytes + tamanho do nome)
      const lh = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true);   // Signature PK\x03\x04
      lv.setUint16(4, 20, true);           // Version needed (2.0)
      lv.setUint16(6, 0x0800, true);       // General purpose bit flag (bit 11 = UTF-8 filename)
      lv.setUint16(8, 0, true);            // Compression method (0 = Store / Sem compressão)
      lv.setUint16(10, f.dosTime, true);   // Last mod file time
      lv.setUint16(12, f.dosDate, true);   // Last mod file date
      lv.setUint32(14, crc, true);         // CRC-32
      lv.setUint32(18, size, true);        // Compressed size
      lv.setUint32(22, size, true);        // Uncompressed size
      lv.setUint16(26, nameBytes.length, true); // File name length
      lv.setUint16(28, 0, true);           // Extra field length
      lh.set(nameBytes, 30);

      localHeaders.push(lh, f.data);

      // Central directory file header (46 bytes + tamanho do nome)
      const ch = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);   // Signature PK\x01\x02
      cv.setUint16(4, 20, true);           // Version made by (2.0)
      cv.setUint16(6, 20, true);           // Version needed to extract (2.0)
      cv.setUint16(8, 0x0800, true);       // General purpose bit flag (UTF-8)
      cv.setUint16(10, 0, true);           // Compression method (0 = Store)
      cv.setUint16(12, f.dosTime, true);   // Last mod file time
      cv.setUint16(14, f.dosDate, true);   // Last mod file date
      cv.setUint32(16, crc, true);         // CRC-32
      cv.setUint32(20, size, true);        // Compressed size
      cv.setUint32(24, size, true);        // Uncompressed size
      cv.setUint16(28, nameBytes.length, true); // File name length
      cv.setUint16(30, 0, true);           // Extra field length
      cv.setUint16(32, 0, true);           // File comment length
      cv.setUint16(34, 0, true);           // Disk number start
      cv.setUint16(36, 0, true);           // Internal file attributes
      cv.setUint32(38, 0, true);           // External file attributes
      cv.setUint32(42, offset, true);      // Relative offset of local header
      ch.set(nameBytes, 46);

      centralHeaders.push(ch);
      offset += lh.length + size;
    }

    const cdOffset = offset;
    let cdSize = 0;
    for (const ch of centralHeaders) cdSize += ch.length;

    // End of central directory record (22 bytes)
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);     // Signature PK\x05\x06
    ev.setUint16(4, 0, true);              // Number of this disk
    ev.setUint16(6, 0, true);              // Disk with central directory
    ev.setUint16(8, this.files.length, true);  // Entries in this disk
    ev.setUint16(10, this.files.length, true); // Total entries
    ev.setUint32(12, cdSize, true);        // Size of central directory
    ev.setUint32(16, cdOffset, true);      // Offset of central directory
    ev.setUint16(20, 0, true);             // Comment length

    // Aloca buffer total e preenche partes
    const totalLength = offset + cdSize + 22;
    const finalBuffer = new Uint8Array(totalLength);
    let cur = 0;
    for (const part of localHeaders) {
      finalBuffer.set(part, cur);
      cur += part.length;
    }
    for (const ch of centralHeaders) {
      finalBuffer.set(ch, cur);
      cur += ch.length;
    }
    finalBuffer.set(eocd, cur);

    return finalBuffer;
  }

  /**
   * Gera um Blob pronto para download
   * @param {string} mimeType
   * @returns {Blob}
   */
  generateBlob(mimeType = 'application/zip') {
    const uint8 = this.generateUint8Array();
    return new Blob([uint8], { type: mimeType });
  }

  /**
   * Inicia o download do arquivo ZIP no navegador
   * @param {string} filename Nome do arquivo ZIP
   */
  downloadZip(filename = 'fotos_carimbadas.zip') {
    const blob = this.generateBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }
}

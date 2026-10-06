# DIRETRIZES E REGRAS DO AGENTE - STAMP-CAMERA

## 1. IDENTIDADE DO PROJETO
- Nome: **STAMP-CAMERA**
- Subtítulo: **Carimbo técnico e geográfico para fotografias**
- Objetivo: Ferramenta web para inserir automaticamente ou manualmente informações técnicas sobre uma fotografia, gerando um carimbo visual configurável diretamente sobre a imagem.

## 2. REGRAS DE PRIVACIDADE E ARQUITETURA
- **100% Client-side (Processamento local)**: Toda operação ocorre no navegador do usuário.
- Nenhuma imagem, coordenada ou metadado pode ser transmitido a servidores externos.
- Compatível com GitHub Pages e execução offline.
- Não inventar informações (coordenadas, endereços, datas). Se um dado não estiver no EXIF, deve ser marcado como ausente ou MANUAL quando inserido pelo usuário.

## 3. IDENTIFICAÇÃO DE ORIGEM
- Todo dado deve explicitar se é `AUTO` (extraído dos metadados EXIF) ou `MANUAL` (inserido pelo usuário).

## 4. PADRÕES TÉCNICOS
- Canvas 2D de alta fidelidade para renderização da imagem final.
- Preservação da resolução e qualidade da fotografia original na exportação.
- Correção automática da orientação EXIF da imagem.
- Suporte a posicionamento em grade (9 pontos) e arrasto livre (drag-and-drop).
- Múltiplos formatos de coordenadas: Decimal com cardinalidade, DMS (Graus, Minutos e Segundos), DDM (Graus e Minutos Decimais), Decimal simples e formato customizado.
- Presets técnicos: Perícia, Obra, Inspeção predial, Fiscalização, Registro fotográfico, Vistoria, etc.
- Exportação em JPG, PNG, WebP com controle de qualidade.
- Suporte a temas Claro e Escuro (WCAG AA).

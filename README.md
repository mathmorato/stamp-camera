# STAMP-CAMERA

> **Carimbo técnico e geográfico para fotografias**  
> Aplicação web 100% *client-side* para auditoria, engenharia, perícia judicial, inspeção predial e documentação técnica georreferenciada.

---

## 1. Objetivo

O **STAMP-CAMERA** foi concebido para inserir automaticamente ou manualmente informações técnicas e geográficas sobre fotografias, produzindo um carimbo visual padronizado, legível e configurável diretamente sobre o arquivo de imagem, preservando a foto original intacta e garantindo total privacidade aos dados.

Principais informações suportadas no carimbo:
- Coordenadas geográficas (Latitude e Longitude) em múltiplos formatos técnicos;
- Altitude e dados de posicionamento;
- Endereço físico (Logradouro, Número, Bairro, Cidade, Estado, País, CEP);
- Data e horário precisos com suporte a padrões brasileiros e internacionais;
- Identificação da fotografia com numeração automática sequencial;
- Identificação da obra, vistoria e laudo técnico;
- Campos totalmente personalizáveis.

---

## 2. Privacidade e Processamento 100% Local

A privacidade e a segurança das imagens são os pilares fundamentais do STAMP-CAMERA:
- **Zero envio para servidores:** Nenhuma fotografia, coordenada GPS, endereço ou metadado sai do navegador do usuário.
- **Sem backend obrigatório:** Todo o processamento de leitura de binários EXIF, correção de orientação, cálculo geométrico e renderização gráfica via Canvas 2D ocorre no dispositivo local.
- **Offline First:** O sistema funciona de forma totalmente autônoma e pode ser executado em ambiente desconectado ou hospedado estaticamente no **GitHub Pages**.
- **Sem telemetria nem rastreadores externos:** Total conformidade com exigências de sigilo profissional e perícia.

---

## 3. Rastreabilidade e Regra Contra Informação Inventada

Em conformidade rigorosa com normas técnicas de perícia e laudos de engenharia:
- Cada campo apresenta indicador explícito de origem: `[AUTO]` (extraído comprovadamente dos metadados EXIF da imagem) ou `[MANUAL]` (inserido ou editado pelo operador).
- Se a fotografia não possuir coordenadas GPS ou data/hora nos metadados, a aplicação alerta expressamente sobre a ausência e permite preenchimento manual transparente, nunca criando dados fictícios.

---

## 4. Arquitetura

O projeto adota uma arquitetura modular em Vanilla JavaScript (ES Modules) e Vanilla CSS:

```
stamp-camera/
├── index.html                 # Ponto de entrada executável da aplicação
├── AGENTS.md                  # Regras e diretrizes do agente
├── package.json               # Configurações do projeto e scripts de execução
├── README.md                  # Documentação completa
├── css/
│   ├── theme.css              # Tokens de design, cores e suporte a Dark/Light Mode
│   ├── main.css               # Estilos globais e componentes base acessíveis
│   └── stamp-camera.css       # Layout 3 colunas, painéis, grade de posicionamento
└── js/
    ├── config.js              # Configurações padrão, enums e formatos
    ├── exif-reader.js         # Leitor binário EXIF/TIFF 100% client-side
    ├── geolocation.js         # Conversores de coordenadas (Decimal, DMS, DDM)
    ├── image-loader.js        # Carregador, normalizador de orientação e gerador de testes
    ├── stamp-engine.js        # Motor Canvas 2D de renderização e posicionamento
    ├── templates.js           # Modelos 1 a 5 e presets técnicos (Perícia, Obra, etc.)
    ├── storage.js             # Gerenciador de persistência local (localStorage)
    ├── export.js              # Exportação de alta fidelidade em JPG, PNG e WebP
    ├── i18n.js                # Dicionário de internacionalização (PT-BR, EN, ES)
    ├── main.js                # Inicializador da aplicação
    └── tools/
        └── stamp-camera/
            ├── tool.js        # Gerenciamento de estado reativo e regras de negócio
            └── ui.js          # Controladores de tela e eventos de arraste
```

---

## 5. Formatos de Coordenadas Suportados

1. **Decimal Cardinal:** `15.869969° S, 50.852275° W`
2. **Graus, Minutos e Segundos (DMS):** `15°52'11.89"S, 50°51'08.19"W`
3. **Graus e Minutos Decimais (DDM):** `15°52.198'S, 50°51.136'W`
4. **Apenas Decimal com Sinal:** `Lat: -15.86996936, Long: -50.85227460`
5. **Formato Customizado:** Configuração livre de máscara.

---

## 6. Modelos e Presets Técnicos

O sistema disponibiliza modelos pré-formatados prontos para uso:
- **Modelo 1 (Simples):** Data, Hora e Coordenadas;
- **Modelo 2 (Localização):** Data/Hora, Endereço completo, Bairro, Cidade/Estado e Coordenadas;
- **Modelo 3 (Técnico):** Formatação em caixa alta para laudos (DATA, HORA, LOCAL, COORDENADAS);
- **Modelo 4 (Fotografia Pericial):** Identificação completa com Número da Foto, Obra e Laudo/Relatório;
- **Modelo 5 (Personalizado):** Liberdade total para adição, reordenação e exclusão de blocos;
- **Presets por área:** *Perícia Judicial*, *Obra & Construção Civil*, *Inspeção Predial*, *Fiscalização Ambiental/Urbana*, *Registro Fotográfico* e *Vistoria*.

---

## 7. Como Executar

### 7.1 Execução Direta (Sem dependências)
Basta abrir o arquivo `index.html` em qualquer navegador web moderno (Chrome, Edge, Firefox, Safari).

### 7.2 Execução via Servidor Local (Recomendado)
Para executar com suporte nativo a ES Modules via servidor HTTP:

```bash
# Opção 1: Usando npx
npx serve .

# Opção 2: Usando Python
python -m http.server 8080
```

Abra `http://localhost:3000` ou `http://localhost:8080` no seu navegador.

### 7.3 Hospedagem no GitHub Pages
Como o STAMP-CAMERA não necessita de servidores, basta publicar o repositório na branch `main` e ativar o GitHub Pages nas configurações do repositório (`Settings > Pages > Branch: main / root`).

---

## 8. Exportação

- Formatos: **JPG** (com controle de qualidade e compressão), **PNG** (sem perdas) e **WebP**.
- Preservação da resolução original: O carimbo é renderizado em resolução nativa total da fotografia original.
- Nomenclatura automática preservando o arquivo original: Exemplo: `foto_001.jpg` → `foto_001_stamp.jpg`.

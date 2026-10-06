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

---

## 25. SISTEMA DE VERSIONAMENTO
### 25.1. Formato Obrigatório
A versão deverá seguir obrigatoriamente o formato:
`v.X.Y.Z`

Exemplo:
`v.1.0.0`

A versão deverá estar visível no rodapé da aplicação e na constante central `const VERSION = "v.X.Y.Z";`.

### 25.2. Regra de Incremento
A ordem de crescimento será:
**Z → Y → X**

- **Incremento de Z:**
  Enquanto Z for menor que 9, incrementar apenas Z.
  Exemplo: `v.1.0.0` → `v.1.0.1` até `v.1.0.9`.

- **Incremento de Y:**
  Quando Z estiver em 9 e uma nova alteração exigir incremento:
  `v.1.0.9` → `v.1.1.0`
  (Z retorna para 0 e Y aumenta em 1).

- **Incremento de X:**
  Quando Y e Z estiverem em 9:
  `v.1.9.9` → `v.2.0.0`
  (Y e Z retornam para 0 e X aumenta em 1).

### 25.3. Limites
- Z nunca poderá ser maior que 9.
- Y nunca poderá ser maior que 9.
- X não possui limite superior.
- Nunca utilizar `v.1.0.10`.
- Nunca utilizar `v.1.10.0`.

---

## 26. REGRA ABSOLUTA DE VERSIONAMENTO
TODA alteração no projeto deve gerar uma nova versão sem exceções.
- Manter constante central no código: `const VERSION = "v.X.Y.Z";`
- Exibir a versão na interface (rodapé e/ou área de configurações/informações).
- Atualizar badges ou cabeçalhos de documentação.

---

## 27. REGRA DE INCREMENTO DA VERSÃO
1. Identificar versão atual (`v.X.Y.Z`).
2. Aplicar a regra sequencial $Z \rightarrow Y \rightarrow X$:
   - Se $Z < 9$: incrementar apenas $Z$ (ex: `v.2.4.0` → `v.2.4.1`).
   - Se $Z = 9$ e $Y < 9$: $Z$ retorna para 0 e $Y$ aumenta em 1 (ex: `v.2.4.9` → `v.2.5.0`).
   - Se $Y = 9$ e $Z = 9$: $Y$ e $Z$ retornam para 0 e $X$ aumenta em 1 (ex: `v.2.9.9` → `v.3.0.0`).
3. Executar alteração e atualizar a versão central e exibida.
4. Testar e commitar.

---

## 28. FLUXO OBRIGATÓRIO GIT
1. `git status`
2. Editar código
3. Testar
4. Verificar `git diff`
5. Atualizar versão
6. Testar novamente
7. `git status`
8. `git add`
9. `git commit`
10. `git push`

---

## 29. PADRÃO OBRIGATÓRIO DE COMMIT
Formato obrigatório:
`v.X.Y.Z: descrição objetiva da alteração`

Exemplos:
- `v.1.0.1: corrige cálculo de renderização do carimbo`
- `v.1.1.0: adiciona suporte a novos formatos de coordenadas`
- `v.1.1.1: corrige responsividade do painel de campos`

Descrição curta, objetiva e em português. Proibidas mensagens genéricas.

---

## 30. PUSH
- Realizar push para a branch oficial de publicação do projeto (geralmente `main`).
- Diagnosticar e resolver conflitos técnicos caso ocorram.
- Apenas confirmar push quando concluído com sucesso.

---

## 31. NÃO QUEBRAR FUNCIONALIDADES EXISTENTES
Proibido regredir ou remover funcionalidades sem comando explícito. Checar chamadas de funções, variáveis e fórmulas antes de alterações.

---

## 32. TRATAMENTO DE ERROS
Corrigir a causa-raiz, nunca apenas mascarar sintomas ou silenciar erros. Testar os efeitos colaterais.

---

## 33. PROTEÇÃO CONTRA ALTERAÇÕES INDEVIDAS
Nunca alterar dados ou informações técnicas/metodológicas por julgamento arbitrário. Preservar a integridade técnica das fotografias e perícia.

---

## 34. DOCUMENTAÇÃO
Manter documentação e comentários técnicos atualizados e objetivos.

---

## 35. REGRA DE ALTERAÇÕES MÍNIMAS
Altere apenas o necessário com menor risco de regressão. Não reescreva código estável sem justificativa técnica.

---

## 36. MELHORIAS PROATIVAS
Problemas técnicos diretamente relacionados ao componente em edição (ex: acessibilidade de botão adjacente, erro de ordenação, overflow na mesma tabela) podem e devem ser corrigidos de forma proativa. Não expandir para refatorações não correlatas.

---

## 37. REGRA PARA GRANDES ALTERAÇÕES
Dividir a implementação em etapas internas autônomas: analisar → fatiar → implementar → testar cada parte → integrar → testar tudo → versionar → commitar → push.

---

## 38. CRITÉRIO DE CONCLUSÃO
Uma tarefa só está concluída com todos os itens satisfeitos:
- [ ] Alteração implementada;
- [ ] Código funcional sem erros de console;
- [ ] Funcionalidades existentes preservadas;
- [ ] Testes realizados;
- [ ] Interface e responsividade validadas;
- [ ] Dark mode verificado;
- [ ] Versão incrementada e visível (regra Z → Y → X);
- [ ] `git diff` verificado;
- [ ] Commit no padrão oficial realizado;
- [ ] Push concluído com sucesso.

---

## 39. RELATÓRIO FINAL OBRIGATÓRIO
Ao concluir qualquer intervenção, responder rigorosamente no formato:

```markdown
## Versão
v.X.Y.Z

## Alterações realizadas
• alteração 1
• alteração 2

## Arquivos principais alterados
• caminho/arquivo.html

## Validação funcional
• teste realizado
• teste realizado

## Git
Commit:
v.X.Y.Z: descrição objetiva

Push:
Concluído para a branch [nome]
```

---

## 40. REGRA DE TRANSPARÊNCIA
Nunca inventar testes, commits ou pushs. Se algo não pôde ser executado, informar com total precisão técnica: "Não foi possível validar X porque Y".

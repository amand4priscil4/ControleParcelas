# 💳 Sistema de Controle de Parcelas - PWA

Sistema moderno e intuitivo para controlar compras parceladas no cartão, desenvolvido como Progressive Web App (PWA).

## ✨ Novidades do Design

- 🎨 Interface moderna com gradientes e sombras suaves
- 🌈 Cores vibrantes e design profissional
- 📱 Totalmente responsivo (funciona perfeitamente no celular)
- 🔄 Animações suaves ao navegar entre páginas
- 💡 Mensagens claras e intuitivas
- 🏷️ Badges coloridos para bandeiras de cartão
- ⚡ Transições fluidas e feedback visual

## 📋 Funcionalidades

- ✅ Cadastro de pessoas
- ✅ Cadastro de cartões (com bandeira opcional)
- ✅ Registro de compras parceladas com cartão usado
- ✅ Visualização de compras por mês
- ✅ Relatório mensal com valores a pagar por pessoa e cartão
- ✅ Armazenamento local (funciona offline)
- ✅ Instalável como aplicativo

## 🚀 Como Usar

### Opção 1: Abrir localmente

1. Abra o arquivo `index.html` em um navegador moderno (Chrome, Edge, Firefox, Safari)
2. O sistema funcionará imediatamente

### Opção 2: Hospedar online (recomendado para PWA completo)

Você pode hospedar gratuitamente em:

#### **Netlify** (Mais fácil):
1. Acesse https://app.netlify.com/drop
2. Arraste todos os arquivos para a área de upload
3. Pronto! Você terá uma URL tipo: https://seu-app.netlify.app

#### **GitHub Pages**:
1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Vá em Settings → Pages → Selecione a branch main
4. Acesse: https://seu-usuario.github.io/nome-repositorio

#### **Vercel**:
1. Acesse https://vercel.com
2. Crie uma conta gratuita
3. Faça upload dos arquivos
4. Deploy automático

## 📱 Instalação como App

Depois de hospedar online:

**No celular:**
1. Abra o site no navegador
2. Chrome: Toque no menu (⋮) → "Adicionar à tela inicial"
3. Safari: Toque em compartilhar → "Adicionar à Tela de Início"

**No computador:**
1. Abra o site no Chrome/Edge
2. Clique no ícone de instalação na barra de endereço
3. Ou vá em Menu → "Instalar aplicativo"

## 💡 Como Funciona

### 1. Cadastrar Pessoas
- Vá na aba "Pessoas"
- Digite o nome e clique em "Adicionar Pessoa"

### 2. Cadastrar Cartões
- Vá na aba "Cartões"
- Digite o nome/apelido do cartão (Ex: Nubank, Itaú, Cartão da Mãe)
- Opcionalmente selecione a bandeira (Visa, Mastercard, Elo, etc)
- Clique em "Adicionar Cartão"

### 3. Registrar Compras
- Vá na aba "Compras"
- Selecione a pessoa
- Selecione o cartão usado
- Preencha descrição, valor, número de parcelas e data
- Clique em "Adicionar Compra"

### 4. Visualizar por Mês
- Na aba "Compras", use o filtro de mês
- Veja apenas as compras de um período específico

### 5. Relatório Mensal
- Vá na aba "Relatório"
- Selecione o mês desejado
- Veja quanto cada pessoa tem a pagar naquele mês
- O relatório mostra também em qual cartão foi a compra
- O sistema calcula automaticamente qual parcela está ativa

## 🗂️ Estrutura dos Arquivos

```
📁 controle-parcelas/
├── index.html          # Página principal
├── style.css           # Estilos
├── app.js             # Lógica do aplicativo
├── sw.js              # Service Worker (offline)
├── manifest.json      # Configuração PWA
├── icon-192.png       # Ícone pequeno
├── icon-512.png       # Ícone grande
└── README.md          # Este arquivo
```

## 💾 Banco de Dados

O sistema usa SQLite via SQL.js, armazenado no localStorage do navegador:
- ✅ Funciona offline
- ✅ Dados salvos automaticamente
- ✅ Não precisa de servidor
- ⚠️ Os dados ficam apenas no dispositivo usado

### Backup dos Dados

Para não perder dados, recomendo:
1. Sempre use o mesmo navegador e dispositivo
2. Ou hospede online e acesse sempre pela mesma URL
3. Futuramente pode-se adicionar exportação para Excel/CSV

## 🎨 Personalização

Você pode personalizar as cores editando o arquivo `style.css`:

```css
/* Cores principais */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Fundo */
background: #4CAF50; /* Verde principal */
```

## 🐛 Solução de Problemas

**"Nenhuma compra aparece":**
- Certifique-se de ter cadastrado pessoas primeiro

**"Não consigo instalar como app":**
- O site precisa estar em HTTPS (hospedado online)
- Use Chrome, Edge ou Safari

**"Perdi meus dados":**
- Os dados ficam no localStorage do navegador
- Se limpar cache, os dados são perdidos
- Use sempre o mesmo navegador/dispositivo

## 📝 Exemplo de Uso

1. Cadastre as pessoas: Mãe, João, Maria
2. Cadastre os cartões: Nubank (Mastercard), Itaú (Visa)
3. Registre uma compra:
   - Pessoa: João
   - Cartão: Nubank
   - Descrição: Notebook
   - Valor: R$ 3.600,00
   - Parcelas: 12x
   - Data: 01/12/2024

4. No relatório de dezembro/2024, aparecerá:
   - João: Notebook - 💳 Nubank (Mastercard) - Parcela 1/12: R$ 300,00

5. No relatório de janeiro/2025, aparecerá:
   - João: Notebook - 💳 Nubank (Mastercard) - Parcela 2/12: R$ 300,00

E assim por diante!

## 🔄 Atualizações Futuras Possíveis

- [ ] Exportar dados para Excel/CSV
- [ ] Gráficos de gastos
- [ ] Marcação de parcelas pagas
- [ ] Categorias de compras
- [ ] Sincronização na nuvem

## 📧 Suporte

Se tiver dúvidas ou sugestões, pode me chamar! 😊

---

Desenvolvido com ❤️ para facilitar o controle de parcelas

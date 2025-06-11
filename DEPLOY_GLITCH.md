# Deploy no Glitch - Instruções

## 📋 Pré-requisitos
- Conta no Glitch (https://glitch.com)
- Projeto compactado em ZIP

## 🚀 Passos para Deploy

### 1. Preparar o Projeto
1. Baixe todo o projeto como ZIP
2. Certifique-se de que todos os arquivos estão incluídos
3. Verifique se o `package.json` está correto

### 2. Criar Projeto no Glitch
1. Acesse https://glitch.com
2. Clique em "New Project"
3. Selecione "Import from GitHub" ou "Upload a Project"
4. Faça upload do arquivo ZIP

### 3. Configurar Variáveis de Ambiente
No arquivo `.env` do Glitch, adicione:
```
ADMIN_PASSWORD=ProjetoPi2025
```

### 4. Verificar Configurações

#### package.json
Certifique-se de que o `package.json` contém:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

#### server.js
Verifique se o servidor está configurado para:
- Usar `process.env.PORT` ou porta 3000
- Escutar em `0.0.0.0`
- CORS habilitado para todas as origens

### 5. Testar o Deploy
1. Aguarde o Glitch instalar as dependências
2. Verifique os logs para erros
3. Acesse a URL fornecida pelo Glitch
4. Teste as funcionalidades principais:
   - Criação de sala
   - Entrada em sala
   - Chat
   - Painel administrativo

### 6. URLs de Acesso
- **Jogo Principal**: `https://seu-projeto.glitch.me`
- **Painel Admin**: `https://seu-projeto.glitch.me/admin`

## 🔧 Configurações Específicas do Glitch

### Estrutura de Arquivos
```
projeto/
├── server.js          # Arquivo principal
├── package.json       # Dependências
├── .env               # Variáveis de ambiente
├── public/            # Arquivos estáticos
│   ├── index.html
│   ├── admin.html
│   ├── css/
│   ├── js/
│   ├── data/
│   └── assets/
└── database/          # Banco de dados (será criado automaticamente)
```

### Dependências Necessárias
- express
- socket.io
- sqlite3
- cors
- uuid
- bcrypt

### Portas e Networking
- O Glitch define automaticamente a porta via `process.env.PORT`
- Socket.IO está configurado para funcionar com proxy
- CORS habilitado para todas as origens

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` no terminal do Glitch

### Erro: "Port already in use"
- O Glitch gerencia as portas automaticamente
- Certifique-se de usar `process.env.PORT`

### Socket.IO não conecta
- Verifique se o CORS está habilitado
- Confirme se o Socket.IO está configurado corretamente

### Banco de dados não funciona
- O SQLite3 pode ter problemas no Glitch
- Considere usar JSON como alternativa (já implementado)

## 📊 Monitoramento

### Logs
- Acesse os logs pelo painel do Glitch
- Monitore erros de conexão
- Verifique performance

### Métricas
- Número de salas ativas
- Jogadores conectados
- Uso de recursos

## 🔒 Segurança

### Variáveis Sensíveis
- Mantenha a senha do admin no `.env`
- Não exponha informações sensíveis nos logs

### Validação
- Todas as entradas são validadas
- Mensagens de chat são sanitizadas
- Senhas de sala são geradas automaticamente

## 🎯 Otimizações para Produção

### Performance
- Arquivos estáticos são servidos pelo Express
- Socket.IO otimizado para múltiplas conexões
- Banco de dados em memória para melhor performance

### Escalabilidade
- Estrutura preparada para múltiplas salas
- Sistema de rooms do Socket.IO
- Gerenciamento eficiente de memória

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Glitch
2. Confirme se todas as dependências foram instaladas
3. Teste localmente primeiro
4. Verifique a documentação do Socket.IO para Glitch

## 🎉 Após o Deploy

1. Teste todas as funcionalidades
2. Compartilhe a URL com os usuários
3. Monitore o uso e performance
4. Colete feedback dos usuários

---

**Projeto desenvolvido para o Projeto Pi 2025**
**Focado no desenvolvimento de habilidades socioemocionais**


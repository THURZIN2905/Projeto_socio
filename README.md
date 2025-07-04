# Jogo Multiplayer de Habilidades Socioemocionais

Um jogo online multiplayer desenvolvido em JavaScript para adolescentes, focado no desenvolvimento de habilidades socioemocionais de forma divertida e colaborativa.

## 🎯 Características Principais

### 🎮 Gameplay
- **Multiplayer em tempo real** com Socket.IO
- **20 situações-problema** baseadas em cenários reais
- **20 habilidades socioemocionais** com descrições detalhadas
- **Sistema de pontuação** baseado em pesos específicos (1-20)
- **Cronômetro de 5 minutos** por rodada
- **Ranking ao vivo** com frases motivacionais

### 🎨 Interface
- **Design jovem e colorido** com gradientes modernos
- **Cartas animadas** com efeitos visuais (brilho, rotação, bordas dinâmicas)
- **Responsivo** para desktop e mobile
- **Modo escuro/claro** opcional
- **4 temas visuais**: Escola, Espaço, TikTok, Futebol

### 👥 Sistema Social
- **Salas independentes** com senhas automáticas
- **Chat em tempo real** por sala
- **Avatares personalizáveis** (6 opções)
- **Times opcionais** para jogadores
- **Sistema de conquistas** desbloqueáveis

### 🔧 Funcionalidades Técnicas
- **VLibras** integrado para acessibilidade
- **Música de fundo** Lo-Fi/Hip-Hop
- **Efeitos sonoros** e vibração nos últimos 30 segundos
- **Frases motivacionais** entre rodadas
- **Sistema de administração** completo

## 🏗️ Arquitetura

### Backend (Node.js)
- **Express.js** - Servidor web
- **Socket.IO** - Comunicação em tempo real
- **SQLite3** - Banco de dados simples
- **CORS** habilitado para frontend-backend

### Frontend (Vanilla JavaScript)
- **HTML5/CSS3/ES6+** - Interface moderna
- **Socket.IO Client** - Comunicação com servidor
- **CSS Grid/Flexbox** - Layout responsivo
- **CSS Animations** - Efeitos visuais

## 📁 Estrutura do Projeto

```
jogo-habilidades-socioemocionais/
├── server.js                 # Servidor principal
├── package.json              # Dependências
├── public/
│   ├── index.html            # Página principal
│   ├── admin.html            # Painel administrativo
│   ├── css/
│   │   ├── style.css         # Estilos principais
│   │   └── admin.css         # Estilos do admin
│   ├── js/
│   │   ├── game.js           # Lógica do jogo
│   │   ├── admin.js          # Lógica do admin
│   │   └── socket-client.js  # Cliente Socket.IO
│   ├── data/
│   │   ├── situacoes.json    # 20 situações-problema
│   │   ├── habilidades.json  # 20 habilidades
│   │   ├── pontuacao.json    # Tabela de pontuação
│   │   └── achievements.json # Sistema de conquistas
│   └── assets/
│       ├── sounds/           # Arquivos de áudio
│       ├── images/           # Imagens do jogo
│       └── avatars/          # Avatares dos jogadores
└── database/
    └── game.db              # Banco SQLite
```

## 🎯 Habilidades Socioemocionais

1. **Empatia** - Compreender sentimentos dos outros
2. **Autocontrole** - Regular emoções e impulsos
3. **Comunicação Assertiva** - Expressar-se de forma clara
4. **Resiliência** - Superar adversidades
5. **Colaboração** - Trabalhar em equipe
6. **Autoconhecimento** - Consciência sobre si mesmo
7. **Liderança** - Inspirar e guiar outros
8. **Resolução de Conflitos** - Mediar disputas
9. **Pensamento Crítico** - Analisar objetivamente
10. **Adaptabilidade** - Ajustar-se a mudanças
11. **Responsabilidade** - Assumir consequências
12. **Criatividade** - Gerar ideias originais
13. **Tolerância à Frustração** - Lidar com decepções
14. **Escuta Ativa** - Ouvir atentamente
15. **Autoestima** - Valorizar-se positivamente
16. **Gestão do Tempo** - Organizar prioridades
17. **Coragem** - Enfrentar medos
18. **Paciência** - Manter calma
19. **Gratidão** - Reconhecer aspectos positivos
20. **Tomada de Decisão** - Fazer escolhas conscientes

## 🏆 Sistema de Conquistas

- **Primeira Vitória** - Primeiros pontos conquistados
- **Resposta Relâmpago** - Resposta em menos de 10 segundos
- **Pontuação Máxima** - 20 pontos em uma rodada
- **Rei da Colaboração** - Excelência em colaboração
- **Mestre da Liderança** - Habilidades de liderança
- **Comunicador Expert** - Comunicação assertiva
- **Resiliente** - Capacidade de superação
- **Coração Empático** - Demonstração de empatia
- **Pensador Crítico** - Análises certeiras
- **Super Adaptável** - Adaptação a situações

## 🎨 Temas Visuais

### 🏫 Escola (Padrão)
- Cores: Azul e roxo
- Ambiente: Educacional e acolhedor

### 🚀 Espaço
- Cores: Roxo e ciano
- Ambiente: Futurista e explorador

### 📱 TikTok
- Cores: Rosa e ciano neon
- Ambiente: Moderno e viral

### ⚽ Futebol
- Cores: Verde e amarelo
- Ambiente: Esportivo e energético

## 👨‍💼 Painel Administrativo

### Acesso
- **URL**: `/admin`
- **Senha**: `ProjetoPi2025`

### Funcionalidades
- **Visão geral** de salas e jogadores
- **Entrar em qualquer sala** como observador
- **Iniciar/encerrar rodadas** manualmente
- **Monitor de chat** em tempo real
- **Banir salas** ou jogadores
- **Validar pontuações** das rodadas
- **Controle total** do cronômetro

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 14+
- npm ou yarn

### Passos
1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
4. Acesse:
   - **Jogo**: http://localhost:3000
   - **Admin**: http://localhost:3000/admin

## 🌐 Deploy no Glitch

### Preparação
1. Comprima o projeto em um arquivo ZIP
2. Faça upload no Glitch
3. Configure as variáveis de ambiente se necessário
4. O servidor iniciará automaticamente

### Configurações Importantes
- **Porta**: Configurada automaticamente pelo Glitch
- **CORS**: Habilitado para todas as origens
- **Socket.IO**: Configurado para funcionar com proxy

## 🎵 Recursos de Áudio

- **Música de fundo**: Lo-Fi/Hip-Hop em loop
- **Efeitos sonoros**: Notificações e sucessos
- **Controle de volume**: Botão para ligar/desligar
- **Vibração**: Nos últimos 30 segundos da rodada

## ♿ Acessibilidade

- **VLibras**: Widget integrado para tradução em Libras
- **Contraste**: Modo escuro/claro
- **Responsivo**: Funciona em todos os dispositivos
- **Navegação**: Acessível via teclado

## 🎓 Aspectos Pedagógicos

### Objetivos Educacionais
- Desenvolver **inteligência emocional**
- Promover **trabalho em equipe**
- Estimular **pensamento crítico**
- Fortalecer **habilidades sociais**

### Metodologia
- **Aprendizagem baseada em jogos**
- **Situações-problema reais**
- **Feedback imediato**
- **Colaboração entre pares**

## 📊 Métricas e Analytics

- **Tempo de resposta** por jogador
- **Pontuação** baseada em pesos específicos
- **Ranking** em tempo real
- **Conquistas** desbloqueadas
- **Participação** em chat

## 🔒 Segurança

- **Senhas automáticas** para salas
- **Moderação** via painel admin
- **Validação** de entrada de dados
- **Sanitização** de mensagens de chat

## 🚀 Funcionalidades Futuras

- [ ] Sistema de níveis progressivos
- [ ] Relatórios detalhados para educadores
- [ ] Integração com plataformas educacionais
- [ ] Modo offline para situações sem internet
- [ ] Personalização avançada de avatares
- [ ] Sistema de badges e certificados

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais como parte do Projeto Pi 2025.

## 👥 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através do painel administrativo ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ para o desenvolvimento socioemocional de adolescentes**

#   P r o j e t o _ s o c i o  
 
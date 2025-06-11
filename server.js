const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configurações
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'ProjetoPi2025';
const ROUND_TIME = 5 * 60 * 1000; // 5 minutos em millisegundos

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dados do jogo
let situacoes = [];
let habilidades = [];
let pontuacao = {};

// Carregar dados do jogo
function loadGameData() {
  try {
    situacoes = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/situacoes.json'), 'utf8'));
    habilidades = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/habilidades.json'), 'utf8'));
    pontuacao = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/pontuacao.json'), 'utf8'));
    console.log('Dados do jogo carregados com sucesso!');
  } catch (error) {
    console.error('Erro ao carregar dados do jogo:', error);
  }
}

// Estado do jogo
const gameState = {
  rooms: new Map(),
  players: new Map(),
  admins: new Set()
};

// Classe para gerenciar salas
class GameRoom {
  constructor(name, password) {
    this.id = uuidv4();
    this.name = name;
    this.password = password;
    this.players = new Map();
    this.admin = null;
    this.currentRound = null;
    this.roundTimer = null;
    this.gameStarted = false;
    this.chat = [];
    this.theme = 'escola';
    this.roundNumber = 0;
    this.maxRounds = 10;
  }

  addPlayer(playerId, playerData) {
    this.players.set(playerId, {
      id: playerId,
      name: playerData.name,
      avatar: playerData.avatar,
      team: playerData.team,
      score: 0,
      achievements: [],
      isReady: false,
      currentChoice: null,
      responseTime: null
    });
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    if (this.admin === playerId) {
      this.admin = null;
    }
  }

  setAdmin(playerId) {
    this.admin = playerId;
  }

  startRound() {
    if (!this.admin || this.players.size === 0) return false;

    this.roundNumber++;
    const randomSituacao = situacoes[Math.floor(Math.random() * situacoes.length)];
    
    this.currentRound = {
      situacao: randomSituacao,
      startTime: Date.now(),
      endTime: Date.now() + ROUND_TIME,
      responses: new Map()
    };

    // Reset player choices
    this.players.forEach(player => {
      player.currentChoice = null;
      player.responseTime = null;
      player.isReady = false;
    });

    // Start timer
    this.roundTimer = setTimeout(() => {
      this.endRound();
    }, ROUND_TIME);

    return true;
  }

  endRound() {
    if (this.roundTimer) {
      clearTimeout(this.roundTimer);
      this.roundTimer = null;
    }

    // Calculate scores
    this.calculateScores();
    
    this.currentRound = null;
    
    // Check if game should end
    if (this.roundNumber >= this.maxRounds) {
      this.endGame();
    }
  }

  calculateScores() {
    if (!this.currentRound) return;

    const situacaoId = this.currentRound.situacao.id;
    const roundStartTime = this.currentRound.startTime;

    this.players.forEach(player => {
      if (player.currentChoice) {
        const habilidadeId = player.currentChoice;
        const baseScore = pontuacao.pontuacao[situacaoId][habilidadeId] || 1;
        
        // Bonus por velocidade (máximo 5 pontos extras)
        const responseTime = player.responseTime - roundStartTime;
        const speedBonus = Math.max(0, 5 - Math.floor(responseTime / 30000)); // 30 segundos = 1 ponto a menos
        
        const totalScore = baseScore + speedBonus;
        player.score += totalScore;

        // Check achievements
        this.checkAchievements(player, totalScore, responseTime);
      }
    });
  }

  checkAchievements(player, score, responseTime) {
    // Primeira vitória
    if (player.score > 0 && !player.achievements.includes('primeira_vitoria')) {
      player.achievements.push('primeira_vitoria');
    }

    // Resposta mais rápida (menos de 10 segundos)
    if (responseTime < 10000 && !player.achievements.includes('resposta_rapida')) {
      player.achievements.push('resposta_rapida');
    }

    // Pontuação alta (20 pontos em uma rodada)
    if (score >= 20 && !player.achievements.includes('pontuacao_alta')) {
      player.achievements.push('pontuacao_alta');
    }
  }

  endGame() {
    this.gameStarted = false;
    this.roundNumber = 0;
    
    // Determine winner
    let winner = null;
    let maxScore = 0;
    
    this.players.forEach(player => {
      if (player.score > maxScore) {
        maxScore = player.score;
        winner = player;
      }
    });

    return winner;
  }

  addChatMessage(playerId, message) {
    const player = this.players.get(playerId);
    if (player) {
      this.chat.push({
        id: uuidv4(),
        playerId,
        playerName: player.name,
        message,
        timestamp: Date.now()
      });
    }
  }

  getRoomData() {
    return {
      id: this.id,
      name: this.name,
      players: Array.from(this.players.values()),
      admin: this.admin,
      gameStarted: this.gameStarted,
      currentRound: this.currentRound,
      chat: this.chat,
      theme: this.theme,
      roundNumber: this.roundNumber,
      maxRounds: this.maxRounds
    };
  }
}

// Socket.IO eventos
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  // Criar sala
  socket.on('create-room', (data) => {
    const { roomName, playerData } = data;
    const password = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const room = new GameRoom(roomName, password);
    room.addPlayer(socket.id, playerData);
    room.setAdmin(socket.id);
    
    gameState.rooms.set(room.id, room);
    gameState.players.set(socket.id, { roomId: room.id, isAdmin: true });
    
    socket.join(room.id);
    
    socket.emit('room-created', {
      roomId: room.id,
      password: password,
      roomData: room.getRoomData()
    });
  });

  // Entrar na sala
  socket.on('join-room', (data) => {
    const { password, playerData } = data;
    
    let targetRoom = null;
    gameState.rooms.forEach(room => {
      if (room.password === password) {
        targetRoom = room;
      }
    });

    if (targetRoom) {
      targetRoom.addPlayer(socket.id, playerData);
      gameState.players.set(socket.id, { roomId: targetRoom.id, isAdmin: false });
      
      socket.join(targetRoom.id);
      
      socket.emit('room-joined', {
        roomId: targetRoom.id,
        roomData: targetRoom.getRoomData()
      });
      
      // Notificar outros jogadores
      socket.to(targetRoom.id).emit('player-joined', {
        player: targetRoom.players.get(socket.id),
        roomData: targetRoom.getRoomData()
      });
    } else {
      socket.emit('join-error', { message: 'Senha inválida!' });
    }
  });

  // Login admin
  socket.on('admin-login', (data) => {
    const { password } = data;
    
    if (password === ADMIN_PASSWORD) {
      gameState.admins.add(socket.id);
      gameState.players.set(socket.id, { isGlobalAdmin: true });
      
      socket.emit('admin-authenticated', {
        rooms: Array.from(gameState.rooms.values()).map(room => room.getRoomData())
      });
    } else {
      socket.emit('admin-error', { message: 'Senha incorreta!' });
    }
  });

  // Admin entrar em sala
  socket.on('admin-join-room', (data) => {
    const { roomId } = data;
    const room = gameState.rooms.get(roomId);
    
    if (room && gameState.admins.has(socket.id)) {
      socket.join(roomId);
      
      socket.emit('admin-room-joined', {
        roomData: room.getRoomData(),
        habilidades: habilidades
      });
    }
  });

  // Iniciar rodada (apenas admin)
  socket.on('start-round', () => {
    const playerData = gameState.players.get(socket.id);
    if (!playerData) return;

    const room = gameState.rooms.get(playerData.roomId);
    if (!room || room.admin !== socket.id) return;

    if (room.startRound()) {
      io.to(room.id).emit('round-started', {
        situacao: room.currentRound.situacao,
        habilidades: habilidades,
        endTime: room.currentRound.endTime
      });
    }
  });

  // Escolher habilidade
  socket.on('choose-skill', (data) => {
    const { habilidadeId } = data;
    const playerData = gameState.players.get(socket.id);
    if (!playerData) return;

    const room = gameState.rooms.get(playerData.roomId);
    if (!room || !room.currentRound) return;

    const player = room.players.get(socket.id);
    if (player && !player.currentChoice) {
      player.currentChoice = habilidadeId;
      player.responseTime = Date.now();
      player.isReady = true;

      // Notificar sala sobre a escolha
      io.to(room.id).emit('player-choice', {
        playerId: socket.id,
        playerName: player.name,
        hasChosen: true
      });

      // Verificar se todos escolheram
      const allReady = Array.from(room.players.values()).every(p => p.isReady);
      if (allReady) {
        room.endRound();
        io.to(room.id).emit('round-ended', {
          results: Array.from(room.players.values()),
          roomData: room.getRoomData()
        });
      }
    }
  });

  // Chat
  socket.on('send-message', (data) => {
    const { message } = data;
    const playerData = gameState.players.get(socket.id);
    if (!playerData) return;

    const room = gameState.rooms.get(playerData.roomId);
    if (!room) return;

    room.addChatMessage(socket.id, message);
    
    io.to(room.id).emit('new-message', {
      chat: room.chat
    });
  });

  // Mudar tema da sala
  socket.on('change-theme', (data) => {
    const { theme } = data;
    const playerData = gameState.players.get(socket.id);
    if (!playerData) return;

    const room = gameState.rooms.get(playerData.roomId);
    if (!room || room.admin !== socket.id) return;

    room.theme = theme;
    
    io.to(room.id).emit('theme-changed', {
      theme: theme,
      roomData: room.getRoomData()
    });
  });

  // Desconexão
  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
    
    const playerData = gameState.players.get(socket.id);
    if (playerData && playerData.roomId) {
      const room = gameState.rooms.get(playerData.roomId);
      if (room) {
        room.removePlayer(socket.id);
        
        // Se a sala ficou vazia, remover
        if (room.players.size === 0) {
          gameState.rooms.delete(room.id);
        } else {
          // Notificar outros jogadores
          socket.to(room.id).emit('player-left', {
            playerId: socket.id,
            roomData: room.getRoomData()
          });
        }
      }
    }
    
    gameState.players.delete(socket.id);
    gameState.admins.delete(socket.id);
  });
});

// Rotas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API endpoints
app.get('/api/game-data', (req, res) => {
  res.json({
    situacoes,
    habilidades,
    pontuacao
  });
});

app.get('/api/rooms', (req, res) => {
  const rooms = Array.from(gameState.rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    playerCount: room.players.size,
    gameStarted: room.gameStarted
  }));
  res.json(rooms);
});

// Inicializar servidor
loadGameData();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});


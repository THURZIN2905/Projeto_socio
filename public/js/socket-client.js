// Cliente Socket.IO
class SocketClient {
    constructor() {
        this.socket = io();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Eventos de conexão
        this.socket.on('connect', () => {
            console.log('Conectado ao servidor');
        });

        this.socket.on('disconnect', () => {
            console.log('Desconectado do servidor');
        });

        // Eventos de sala
        this.socket.on('room-created', (data) => {
            this.onRoomCreated(data);
        });

        this.socket.on('room-joined', (data) => {
            this.onRoomJoined(data);
        });

        this.socket.on('join-error', (data) => {
            this.onJoinError(data);
        });

        this.socket.on('player-joined', (data) => {
            this.onPlayerJoined(data);
        });

        this.socket.on('player-left', (data) => {
            this.onPlayerLeft(data);
        });

        // Eventos de jogo
        this.socket.on('round-started', (data) => {
            this.onRoundStarted(data);
        });

        this.socket.on('round-ended', (data) => {
            this.onRoundEnded(data);
        });

        this.socket.on('player-choice', (data) => {
            this.onPlayerChoice(data);
        });

        // Eventos de chat
        this.socket.on('new-message', (data) => {
            this.onNewMessage(data);
        });

        // Eventos de tema
        this.socket.on('theme-changed', (data) => {
            this.onThemeChanged(data);
        });

        // Eventos de admin
        this.socket.on('admin-authenticated', (data) => {
            this.onAdminAuthenticated(data);
        });

        this.socket.on('admin-error', (data) => {
            this.onAdminError(data);
        });
    }

    // Métodos para emitir eventos
    createRoom(roomName, playerData) {
        this.socket.emit('create-room', { roomName, playerData });
    }

    joinRoom(password, playerData) {
        this.socket.emit('join-room', { password, playerData });
    }

    startRound() {
        this.socket.emit('start-round');
    }

    chooseSkill(habilidadeId) {
        this.socket.emit('choose-skill', { habilidadeId });
    }

    sendMessage(message) {
        this.socket.emit('send-message', { message });
    }

    changeTheme(theme) {
        this.socket.emit('change-theme', { theme });
    }

    adminLogin(password) {
        this.socket.emit('admin-login', { password });
    }

    // Callbacks (serão implementados no game.js)
    onRoomCreated(data) {}
    onRoomJoined(data) {}
    onJoinError(data) {}
    onPlayerJoined(data) {}
    onPlayerLeft(data) {}
    onRoundStarted(data) {}
    onRoundEnded(data) {}
    onPlayerChoice(data) {}
    onNewMessage(data) {}
    onThemeChanged(data) {}
    onAdminAuthenticated(data) {}
    onAdminError(data) {}
}

// Instância global do cliente
window.socketClient = new SocketClient();


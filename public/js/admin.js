// Admin Panel Controller
class AdminController {
    constructor() {
        this.socket = io();
        this.currentScreen = 'login';
        this.currentRoom = null;
        this.rooms = [];
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSocketEvents();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Password toggle
        document.getElementById('toggle-password').addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Header controls
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Room actions
        document.getElementById('create-test-room').addEventListener('click', () => {
            this.createTestRoom();
        });

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Room modal actions
        document.getElementById('join-room-btn').addEventListener('click', () => {
            this.joinCurrentRoom();
        });

        document.getElementById('start-round-admin').addEventListener('click', () => {
            this.startRoundAdmin();
        });

        document.getElementById('end-game-admin').addEventListener('click', () => {
            this.endGameAdmin();
        });

        document.getElementById('ban-room-btn').addEventListener('click', () => {
            this.showBanModal();
        });

        document.getElementById('confirm-ban').addEventListener('click', () => {
            this.banCurrentRoom();
        });

        // Chat controls
        document.getElementById('clear-chat-btn').addEventListener('click', () => {
            this.clearChat();
        });

        document.getElementById('mute-chat-btn').addEventListener('click', () => {
            this.toggleChatMute();
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    setupSocketEvents() {
        this.socket.on('connect', () => {
            console.log('Admin conectado ao servidor');
        });

        this.socket.on('disconnect', () => {
            console.log('Admin desconectado do servidor');
            this.showNotification('Conexão perdida com o servidor', 'error');
        });

        this.socket.on('admin-authenticated', (data) => {
            this.onAdminAuthenticated(data);
        });

        this.socket.on('admin-error', (data) => {
            this.onAdminError(data);
        });

        this.socket.on('admin-room-joined', (data) => {
            this.onAdminRoomJoined(data);
        });

        // Room events
        this.socket.on('room-created', (data) => {
            this.refreshData();
        });

        this.socket.on('player-joined', (data) => {
            if (this.currentRoom && this.currentRoom.id === data.roomData.id) {
                this.updateRoomModal(data.roomData);
            }
            this.refreshData();
        });

        this.socket.on('player-left', (data) => {
            if (this.currentRoom && this.currentRoom.id === data.roomData.id) {
                this.updateRoomModal(data.roomData);
            }
            this.refreshData();
        });

        this.socket.on('round-started', (data) => {
            if (this.currentRoom) {
                this.updateRoundDisplay(data);
            }
        });

        this.socket.on('round-ended', (data) => {
            if (this.currentRoom) {
                this.updateResultsDisplay(data);
            }
        });

        this.socket.on('new-message', (data) => {
            if (this.currentRoom) {
                this.updateChatDisplay(data.chat);
            }
        });
    }

    handleLogin() {
        const password = document.getElementById('admin-password').value;
        
        if (!password) {
            this.showNotification('Por favor, digite a senha', 'error');
            return;
        }

        this.socket.emit('admin-login', { password });
    }

    togglePasswordVisibility() {
        const input = document.getElementById('admin-password');
        const icon = document.querySelector('#toggle-password i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    onAdminAuthenticated(data) {
        this.rooms = data.rooms;
        this.showScreen('dashboard');
        this.updateDashboard();
        this.startAutoRefresh();
        this.showNotification('Login realizado com sucesso!', 'success');
    }

    onAdminError(data) {
        this.showNotification(data.message, 'error');
    }

    onAdminRoomJoined(data) {
        this.currentRoom = data.roomData;
        this.updateRoomModal(data.roomData);
        this.showNotification('Entrou na sala como administrador', 'success');
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.currentScreen = screenName;
    }

    updateDashboard() {
        this.updateOverviewCards();
        this.updateRoomsGrid();
    }

    updateOverviewCards() {
        const totalRooms = this.rooms.length;
        const totalPlayers = this.rooms.reduce((sum, room) => sum + (room.players ? room.players.length : 0), 0);
        const activeGames = this.rooms.filter(room => room.gameStarted).length;

        document.getElementById('total-rooms').textContent = totalRooms;
        document.getElementById('total-players').textContent = totalPlayers;
        document.getElementById('active-games').textContent = activeGames;
        
        // Update server uptime (mock)
        const uptime = this.formatUptime(Date.now() - (Date.now() % 86400000));
        document.getElementById('server-uptime').textContent = uptime;
    }

    formatUptime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    updateRoomsGrid() {
        const grid = document.getElementById('rooms-grid');
        grid.innerHTML = '';

        if (this.rooms.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-door-open"></i>
                    <h3>Nenhuma sala ativa</h3>
                    <p>As salas criadas pelos jogadores aparecerão aqui.</p>
                </div>
            `;
            return;
        }

        this.rooms.forEach(room => {
            const roomCard = this.createRoomCard(room);
            grid.appendChild(roomCard);
        });
    }

    createRoomCard(room) {
        const div = document.createElement('div');
        div.className = 'room-card';
        div.addEventListener('click', () => this.showRoomModal(room));

        const status = room.gameStarted ? 'active' : 'waiting';
        const statusText = room.gameStarted ? 'Em Jogo' : 'Aguardando';
        const playerCount = room.players ? room.players.length : 0;

        div.innerHTML = `
            <div class="room-header">
                <div class="room-name">${room.name}</div>
                <div class="room-status ${status}">${statusText}</div>
            </div>
            
            <div class="room-info">
                <div class="info-item">
                    <label>Jogadores</label>
                    <span>${playerCount}</span>
                </div>
                <div class="info-item">
                    <label>Rodada</label>
                    <span>${room.roundNumber || 0}/${room.maxRounds || 10}</span>
                </div>
                <div class="info-item">
                    <label>Tema</label>
                    <span>${this.getThemeName(room.theme)}</span>
                </div>
                <div class="info-item">
                    <label>Senha</label>
                    <span>${room.password || '------'}</span>
                </div>
            </div>
            
            <div class="room-actions">
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); adminController.joinRoom('${room.id}')">
                    <i class="fas fa-sign-in-alt"></i>
                    Entrar
                </button>
                <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); adminController.banRoom('${room.id}')">
                    <i class="fas fa-ban"></i>
                    Banir
                </button>
            </div>
        `;

        return div;
    }

    getThemeName(theme) {
        const themes = {
            'escola': 'Escola',
            'espaco': 'Espaço',
            'tiktok': 'TikTok',
            'futebol': 'Futebol'
        };
        return themes[theme] || 'Escola';
    }

    showRoomModal(room) {
        this.currentRoom = room;
        this.updateRoomModal(room);
        document.getElementById('room-modal').classList.add('active');
        
        // Join room for monitoring
        this.socket.emit('admin-join-room', { roomId: room.id });
    }

    updateRoomModal(roomData) {
        if (!roomData) return;

        document.getElementById('room-modal-title').textContent = `Sala: ${roomData.name}`;
        document.getElementById('room-detail-name').textContent = roomData.name;
        document.getElementById('room-detail-password').textContent = roomData.password || '------';
        document.getElementById('room-detail-theme').textContent = this.getThemeName(roomData.theme);
        document.getElementById('room-detail-status').textContent = roomData.gameStarted ? 'Em Jogo' : 'Aguardando';
        document.getElementById('room-detail-round').textContent = `${roomData.roundNumber || 0}/${roomData.maxRounds || 10}`;

        // Update players list
        this.updateModalPlayersList(roomData.players || []);

        // Update chat
        this.updateChatDisplay(roomData.chat || []);

        // Update game controls
        this.updateGameControls(roomData);
    }

    updateModalPlayersList(players) {
        const list = document.getElementById('modal-players-list');
        const count = document.getElementById('modal-player-count');
        
        count.textContent = players.length;
        list.innerHTML = '';

        players.forEach(player => {
            const playerElement = this.createModalPlayerElement(player);
            list.appendChild(playerElement);
        });
    }

    createModalPlayerElement(player) {
        const div = document.createElement('div');
        div.className = 'player-item';

        const isAdmin = player.id === this.currentRoom.admin;
        const adminBadge = isAdmin ? '<span class="player-status">Admin</span>' : '';

        div.innerHTML = `
            <div class="player-avatar">
                <i class="fas ${this.getAvatarIcon(player.avatar)}"></i>
            </div>
            <div class="player-info">
                <div class="player-name">${player.name} ${adminBadge}</div>
                <div class="player-score">Pontos: ${player.score}</div>
                ${player.team ? `<div class="player-team">Time: ${player.team}</div>` : ''}
            </div>
            <div class="player-actions">
                <button class="btn btn-danger btn-small" onclick="adminController.kickPlayer('${player.id}')">
                    <i class="fas fa-user-times"></i>
                </button>
            </div>
        `;

        return div;
    }

    getAvatarIcon(avatarId) {
        const icons = {
            '1': 'fa-user-astronaut',
            '2': 'fa-user-ninja',
            '3': 'fa-user-graduate',
            '4': 'fa-user-tie',
            '5': 'fa-user-secret',
            '6': 'fa-user-md'
        };
        return icons[avatarId] || 'fa-user';
    }

    updateChatDisplay(chatMessages) {
        const container = document.getElementById('modal-chat-messages');
        container.innerHTML = '';

        chatMessages.slice(-20).forEach(message => {
            const messageElement = this.createChatMessageElement(message);
            container.appendChild(messageElement);
        });

        container.scrollTop = container.scrollHeight;
    }

    createChatMessageElement(message) {
        const div = document.createElement('div');
        div.className = 'chat-message';

        const timestamp = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        div.innerHTML = `
            <div class="chat-message-header">
                <span class="chat-player-name">${message.playerName}</span>
                <span class="chat-timestamp">${timestamp}</span>
            </div>
            <div class="chat-message-text">${this.escapeHtml(message.message)}</div>
        `;

        return div;
    }

    updateGameControls(roomData) {
        const roundControl = document.getElementById('round-control');
        
        if (roomData.currentRound) {
            this.updateCurrentRound(roomData.currentRound);
        } else {
            document.getElementById('current-situation-display').textContent = 'Nenhuma rodada ativa';
            document.getElementById('admin-timer-display').textContent = '--:--';
        }
    }

    updateCurrentRound(roundData) {
        const situationDisplay = document.getElementById('current-situation-display');
        situationDisplay.innerHTML = `
            <h6>${roundData.situacao.titulo}</h6>
            <p>${roundData.situacao.descricao}</p>
        `;

        // Update timer
        this.startAdminTimer(roundData.endTime);
    }

    startAdminTimer(endTime) {
        const updateTimer = () => {
            const now = Date.now();
            const timeLeft = Math.max(0, endTime - now);
            
            if (timeLeft === 0) {
                document.getElementById('admin-timer-display').textContent = '00:00';
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            document.getElementById('admin-timer-display').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        
        updateTimer();
        setInterval(updateTimer, 1000);
    }

    updateRoundDisplay(data) {
        this.updateCurrentRound(data);
    }

    updateResultsDisplay(data) {
        // Update player scores in the modal
        if (this.currentRoom) {
            this.currentRoom.players = data.results;
            this.updateModalPlayersList(data.results);
        }
    }

    joinRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (room) {
            this.showRoomModal(room);
        }
    }

    joinCurrentRoom() {
        if (this.currentRoom) {
            window.open(`/?join=${this.currentRoom.password}`, '_blank');
        }
    }

    startRoundAdmin() {
        if (this.currentRoom) {
            this.socket.emit('start-round');
            this.showNotification('Rodada iniciada!', 'success');
        }
    }

    endGameAdmin() {
        if (this.currentRoom && confirm('Tem certeza que deseja encerrar o jogo?')) {
            this.socket.emit('end-game');
            this.showNotification('Jogo encerrado!', 'warning');
        }
    }

    banRoom(roomId) {
        if (confirm('Tem certeza que deseja banir esta sala?')) {
            this.socket.emit('ban-room', { roomId });
            this.showNotification('Sala banida!', 'warning');
            this.refreshData();
        }
    }

    showBanModal() {
        document.getElementById('ban-modal').classList.add('active');
    }

    banCurrentRoom() {
        if (this.currentRoom) {
            this.banRoom(this.currentRoom.id);
            this.closeModal(document.getElementById('ban-modal'));
            this.closeModal(document.getElementById('room-modal'));
        }
    }

    kickPlayer(playerId) {
        if (confirm('Tem certeza que deseja expulsar este jogador?')) {
            this.socket.emit('kick-player', { playerId });
            this.showNotification('Jogador expulso!', 'warning');
        }
    }

    clearChat() {
        if (confirm('Tem certeza que deseja limpar o chat?')) {
            this.socket.emit('clear-chat', { roomId: this.currentRoom.id });
            this.showNotification('Chat limpo!', 'info');
        }
    }

    toggleChatMute() {
        this.socket.emit('toggle-chat-mute', { roomId: this.currentRoom.id });
        this.showNotification('Status do chat alterado!', 'info');
    }

    createTestRoom() {
        const testRoomData = {
            name: `Sala Teste ${Date.now()}`,
            playerData: {
                name: 'Admin Test',
                avatar: '1',
                team: 'Administração'
            }
        };

        this.socket.emit('create-room', testRoomData);
        this.showNotification('Sala de teste criada!', 'success');
    }

    refreshData() {
        this.socket.emit('get-rooms');
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 30000); // Refresh every 30 seconds
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    logout() {
        if (confirm('Tem certeza que deseja sair?')) {
            this.stopAutoRefresh();
            location.reload();
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
        if (modal.id === 'room-modal') {
            this.currentRoom = null;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Set background color based on type
        const colors = {
            success: '#059669',
            error: '#dc2626',
            warning: '#d97706',
            info: '#1e40af'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after duration
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// Initialize admin controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminController = new AdminController();
});


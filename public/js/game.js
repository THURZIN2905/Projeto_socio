// Game Controller
class GameController {
    constructor() {
        this.currentScreen = 'welcome';
        this.playerData = {
            name: '',
            avatar: '1',
            team: ''
        };
        this.roomData = null;
        this.gameData = null;
        this.currentRound = null;
        this.roundTimer = null;
        this.soundEnabled = true;
        this.darkMode = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGameData();
        this.setupSocketCallbacks();
        this.hideLoadingScreen();
        this.setupAudio();
    }

    setupEventListeners() {
        // Welcome screen
        document.getElementById('create-room-btn').addEventListener('click', () => {
            this.showPlayerSetup('create');
        });

        document.getElementById('join-room-btn').addEventListener('click', () => {
            this.showPlayerSetup('join');
        });

        // Player setup
        document.getElementById('back-to-welcome').addEventListener('click', () => {
            this.showScreen('welcome');
        });

        document.getElementById('confirm-setup').addEventListener('click', () => {
            this.confirmPlayerSetup();
        });

        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectAvatar(option.dataset.avatar);
            });
        });

        // Room controls
        document.getElementById('start-round-btn').addEventListener('click', () => {
            this.startRound();
        });

        document.getElementById('leave-room-btn').addEventListener('click', () => {
            this.leaveRoom();
        });

        document.getElementById('change-theme-btn').addEventListener('click', () => {
            this.showThemeModal();
        });

        // Chat
        document.getElementById('send-message-btn').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.toggleSound();
        });

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectTheme(option.dataset.theme);
            });
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

    setupSocketCallbacks() {
        const client = window.socketClient;

        client.onRoomCreated = (data) => {
            this.roomData = data.roomData;
            this.showRoomScreen(data.password);
            this.showNotification('Sala criada com sucesso!', 'success');
        };

        client.onRoomJoined = (data) => {
            this.roomData = data.roomData;
            this.showRoomScreen();
            this.showNotification('Entrou na sala com sucesso!', 'success');
        };

        client.onJoinError = (data) => {
            this.showNotification(data.message, 'error');
        };

        client.onPlayerJoined = (data) => {
            this.roomData = data.roomData;
            this.updatePlayersDisplay();
            this.showNotification(`${data.player.name} entrou na sala`, 'info');
        };

        client.onPlayerLeft = (data) => {
            this.roomData = data.roomData;
            this.updatePlayersDisplay();
            this.showNotification('Um jogador saiu da sala', 'info');
        };

        client.onRoundStarted = (data) => {
            this.currentRound = data;
            this.showRoundState();
            this.startRoundTimer(data.endTime);
            this.displaySituation(data.situacao);
            this.displaySkills(data.habilidades);
            this.playSound('notification');
        };

        client.onRoundEnded = (data) => {
            this.endRound();
            this.showResults(data.results);
            this.roomData = data.roomData;
            this.updatePlayersDisplay();
            this.playSound('success');
        };

        client.onPlayerChoice = (data) => {
            this.showNotification(`${data.playerName} fez sua escolha!`, 'info');
        };

        client.onNewMessage = (data) => {
            this.updateChat(data.chat);
        };

        client.onThemeChanged = (data) => {
            this.applyRoomTheme(data.theme);
            this.roomData = data.roomData;
            this.closeModal(document.getElementById('theme-modal'));
            this.showNotification('Tema da sala alterado!', 'success');
        };
    }

    async loadGameData() {
        try {
            const response = await fetch('/api/game-data');
            this.gameData = await response.json();
        } catch (error) {
            console.error('Erro ao carregar dados do jogo:', error);
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('main-container').classList.remove('hidden');
            }, 500);
        }, 2000);
    }

    setupAudio() {
        const bgMusic = document.getElementById('background-music');
        if (bgMusic && this.soundEnabled) {
            bgMusic.volume = 0.3;
            bgMusic.play().catch(() => {
                // Autoplay blocked, will play on first user interaction
            });
        }
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.currentScreen = screenName;
    }

    showPlayerSetup(mode) {
        this.setupMode = mode;
        
        if (mode === 'create') {
            document.getElementById('room-name-group').classList.remove('hidden');
            document.getElementById('room-password-group').classList.add('hidden');
        } else {
            document.getElementById('room-name-group').classList.add('hidden');
            document.getElementById('room-password-group').classList.remove('hidden');
        }
        
        this.showScreen('player-setup');
    }

    selectAvatar(avatarId) {
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-avatar="${avatarId}"]`).classList.add('selected');
        this.playerData.avatar = avatarId;
    }

    confirmPlayerSetup() {
        const name = document.getElementById('player-name').value.trim();
        const team = document.getElementById('player-team').value.trim();
        
        if (!name) {
            this.showNotification('Por favor, digite seu nome', 'error');
            return;
        }

        this.playerData.name = name;
        this.playerData.team = team;

        if (this.setupMode === 'create') {
            const roomName = document.getElementById('room-name').value.trim();
            if (!roomName) {
                this.showNotification('Por favor, digite o nome da sala', 'error');
                return;
            }
            window.socketClient.createRoom(roomName, this.playerData);
        } else {
            const password = document.getElementById('room-password').value.trim();
            if (!password) {
                this.showNotification('Por favor, digite a senha da sala', 'error');
                return;
            }
            window.socketClient.joinRoom(password, this.playerData);
        }
    }

    showRoomScreen(password = null) {
        this.showScreen('game-room');
        this.updateRoomDisplay(password);
        this.updatePlayersDisplay();
        this.showWaitingState();
    }

    updateRoomDisplay(password = null) {
        if (!this.roomData) return;

        document.getElementById('room-name-display').textContent = this.roomData.name;
        
        if (password) {
            document.getElementById('room-password-display').textContent = `Senha: ${password}`;
        }
        
        document.getElementById('room-theme-display').textContent = `Tema: ${this.getThemeName(this.roomData.theme)}`;
        
        // Show admin controls if user is admin
        const isAdmin = this.roomData.admin === window.socketClient.socket.id;
        document.getElementById('admin-controls').style.display = isAdmin ? 'block' : 'none';
        
        this.applyRoomTheme(this.roomData.theme);
    }

    updatePlayersDisplay() {
        if (!this.roomData) return;

        const playersList = document.getElementById('players-list');
        const playerCount = document.getElementById('player-count');
        
        playerCount.textContent = this.roomData.players.length;
        
        playersList.innerHTML = '';
        
        this.roomData.players.forEach(player => {
            const playerElement = this.createPlayerElement(player);
            playersList.appendChild(playerElement);
        });
    }

    createPlayerElement(player) {
        const div = document.createElement('div');
        div.className = 'player-item';
        
        const isAdmin = player.id === this.roomData.admin;
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

    getThemeName(theme) {
        const themes = {
            'escola': 'Escola',
            'espaco': 'Espaço',
            'tiktok': 'TikTok',
            'futebol': 'Futebol'
        };
        return themes[theme] || 'Escola';
    }

    showWaitingState() {
        document.querySelectorAll('.game-state').forEach(state => {
            state.classList.remove('active');
        });
        document.getElementById('waiting-state').classList.add('active');
    }

    showRoundState() {
        document.querySelectorAll('.game-state').forEach(state => {
            state.classList.remove('active');
        });
        document.getElementById('round-state').classList.add('active');
        
        if (this.roomData) {
            document.getElementById('round-number').textContent = `Rodada ${this.roomData.roundNumber}`;
        }
    }

    startRound() {
        window.socketClient.startRound();
    }

    startRoundTimer(endTime) {
        this.clearRoundTimer();
        
        const updateTimer = () => {
            const now = Date.now();
            const timeLeft = Math.max(0, endTime - now);
            
            if (timeLeft === 0) {
                this.clearRoundTimer();
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            const timerDisplay = document.getElementById('timer-display');
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const timerElement = document.getElementById('round-timer');
            if (timeLeft < 30000) { // Últimos 30 segundos
                timerElement.classList.add('warning');
                if (timeLeft < 10000) { // Últimos 10 segundos
                    this.vibrate();
                }
            } else {
                timerElement.classList.remove('warning');
            }
        };
        
        updateTimer();
        this.roundTimer = setInterval(updateTimer, 1000);
    }

    clearRoundTimer() {
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
            this.roundTimer = null;
        }
    }

    displaySituation(situacao) {
        const content = document.getElementById('situation-content');
        content.innerHTML = `
            <h4>${situacao.titulo}</h4>
            <p>${situacao.descricao}</p>
        `;
    }

    displaySkills(habilidades) {
        const grid = document.getElementById('skills-grid');
        grid.innerHTML = '';
        
        habilidades.forEach(habilidade => {
            const card = this.createSkillCard(habilidade);
            grid.appendChild(card);
        });
    }

    createSkillCard(habilidade) {
        const div = document.createElement('div');
        div.className = 'skill-card';
        div.dataset.skillId = habilidade.id;
        
        // Determinar se é uma carta de alta pontuação
        if (this.currentRound && this.gameData) {
            const situacaoId = this.currentRound.situacao.id;
            const score = this.gameData.pontuacao.pontuacao[situacaoId][habilidade.id];
            if (score >= 15) {
                div.classList.add('high-score');
            }
        }
        
        div.innerHTML = `
            <div class="skill-card-content">
                <div class="skill-name">${habilidade.nome}</div>
                <div class="skill-description">${habilidade.descricao}</div>
            </div>
        `;
        
        div.addEventListener('click', () => {
            this.selectSkill(habilidade.id, div);
        });
        
        return div;
    }

    selectSkill(skillId, cardElement) {
        // Remove selection from other cards
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select this card
        cardElement.classList.add('selected');
        
        // Send choice to server
        window.socketClient.chooseSkill(skillId);
        
        this.playSound('notification');
        this.showNotification('Escolha enviada!', 'success');
    }

    endRound() {
        this.clearRoundTimer();
        this.currentRound = null;
    }

    showResults(results) {
        document.querySelectorAll('.game-state').forEach(state => {
            state.classList.remove('active');
        });
        document.getElementById('results-state').classList.add('active');
        
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '';
        
        // Sort players by score
        const sortedResults = [...results].sort((a, b) => b.score - a.score);
        
        sortedResults.forEach((player, index) => {
            const resultElement = this.createResultElement(player, index + 1);
            resultsList.appendChild(resultElement);
        });
        
        // Show motivational message
        this.showMotivationalMessage();
    }

    createResultElement(player, position) {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        let positionIcon = '';
        let positionText = '';
        
        switch (position) {
            case 1:
                positionIcon = '🥇';
                positionText = 'O pódio é para poucos!';
                break;
            case 2:
                positionIcon = '🥈';
                positionText = 'Quase lá... bora destronar o líder!';
                break;
            case 3:
                positionIcon = '🥉';
                positionText = 'Chegou perto, mas ainda tá no aquecimento!';
                break;
            default:
                positionIcon = `#${position}`;
                positionText = 'Continue tentando!';
        }
        
        div.innerHTML = `
            <div class="result-position">${positionIcon}</div>
            <div class="result-info">
                <div class="result-name">${player.name}</div>
                <div class="result-score">Pontos: ${player.score}</div>
                <div class="result-message">${positionText}</div>
            </div>
        `;
        
        return div;
    }

    showMotivationalMessage() {
        const messages = [
            "Errar faz parte do jogo. O que importa é tentar de novo! 💪",
            "Você já está fazendo história. Continue! 🚀",
            "Sua solução foi braba demais! 🔥",
            "Cada escolha é um aprendizado! ✨",
            "Juntos somos mais fortes! 🤝"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showNotification(randomMessage, 'info', 5000);
    }

    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            window.socketClient.sendMessage(message);
            input.value = '';
        }
    }

    updateChat(chatMessages) {
        const container = document.getElementById('chat-messages');
        container.innerHTML = '';
        
        chatMessages.slice(-50).forEach(message => { // Show last 50 messages
            const messageElement = this.createChatMessage(message);
            container.appendChild(messageElement);
        });
        
        container.scrollTop = container.scrollHeight;
    }

    createChatMessage(message) {
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    leaveRoom() {
        if (confirm('Tem certeza que deseja sair da sala?')) {
            location.reload();
        }
    }

    showThemeModal() {
        const modal = document.getElementById('theme-modal');
        modal.classList.add('active');
    }

    selectTheme(theme) {
        window.socketClient.changeTheme(theme);
    }

    applyRoomTheme(theme) {
        document.body.dataset.roomTheme = theme;
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    toggleTheme() {
        this.darkMode = !this.darkMode;
        document.body.dataset.theme = this.darkMode ? 'dark' : 'light';
        
        const icon = document.querySelector('#theme-toggle i');
        icon.className = this.darkMode ? 'fas fa-moon' : 'fas fa-sun';
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        const icon = document.querySelector('#sound-toggle i');
        icon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        
        const bgMusic = document.getElementById('background-music');
        if (bgMusic) {
            if (this.soundEnabled) {
                bgMusic.play().catch(() => {});
            } else {
                bgMusic.pause();
            }
        }
    }

    playSound(soundName) {
        if (!this.soundEnabled) return;
        
        const audio = document.getElementById(`${soundName}-sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    vibrate() {
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
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
            borderRadius: '0.75rem',
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
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4'
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

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});


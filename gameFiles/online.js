// online.js - PeerJS networking layer for FrontLine10
// Load this BEFORE script.js. Sets window.OnlineMode if URL has ?online=host or ?online=join.
(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('online');
    if (mode !== 'host' && mode !== 'join') return;

    const OnlineMode = {
        isOnline: true,
        isHost: mode === 'host',
        isGuest: mode === 'join',
        myPlayer: mode === 'host' ? 1 : 2,
        opponentPlayer: mode === 'host' ? 2 : 1,
        isConnected: false,
        peer: null,
        conn: null,

        // ---- callbacks set by script.js ----
        onConnected: null,       // () => void
        onOpponentSetup: null,   // (pieces) => void
        onOpponentPick: null,    // ({from, to}) => void
        onStateUpdate: null,     // (state) => void
        onOpponentDisconnect: null,

        // ---- methods called by script.js ----
        sendSetup: function (pieces) {
            send({ type: 'SETUP', pieces });
        },
        sendPick: function (from, to) {
            send({ type: 'PICK', from: from, to: to });
        },
        broadcastState: function (state) {
            send({ type: 'STATE', state: state });
        },
        sendTurn: function (player) {
            send({ type: 'TURN', player: player });
        }
    };

    function send(msg) {
        if (OnlineMode.conn && OnlineMode.conn.open) {
            OnlineMode.conn.send(msg);
        }
    }

    function handleMessage(data) {
        if (!data) return;
        if (data.type === 'SETUP' && OnlineMode.onOpponentSetup) {
            OnlineMode.onOpponentSetup(data.pieces);
        } else if (data.type === 'PICK' && OnlineMode.onOpponentPick) {
            OnlineMode.onOpponentPick({ from: data.from, to: data.to });
        } else if (data.type === 'STATE' && OnlineMode.onStateUpdate) {
            OnlineMode.onStateUpdate(data.state);
        } else if (data.type === 'TURN' && OnlineMode.onTurn) {
            OnlineMode.onTurn(data.player);
        }
    }

    window.OnlineMode = OnlineMode;

    // ---- Lobby UI + connection handling ----
    document.addEventListener('DOMContentLoaded', function () {
        const lobby = document.getElementById('online-lobby');
        const status = document.getElementById('lobby-status');
        const roomInput = document.getElementById('room-id-input');
        const roomDisplay = document.getElementById('room-id-display');
        const joinBtn = document.getElementById('join-btn');

        if (!lobby) {
            console.warn('online-lobby element missing in HTML');
            return;
        }

        lobby.classList.remove('hidden');

        function setupConn() {
            OnlineMode.conn.on('open', function () {
                OnlineMode.isConnected = true;
                if (status) status.textContent = 'Connected!';
                setTimeout(function () {
                    lobby.classList.add('hidden');
                    if (OnlineMode.onConnected) OnlineMode.onConnected();
                }, 400);
            });
            OnlineMode.conn.on('data', handleMessage);
            OnlineMode.conn.on('close', function () {
                OnlineMode.isConnected = false;
                if (status) status.textContent = 'Opponent disconnected';
                lobby.classList.remove('hidden');
                if (OnlineMode.onOpponentDisconnect) OnlineMode.onOpponentDisconnect();
            });
            OnlineMode.conn.on('error', function (err) {
                if (status) status.textContent = 'Error: ' + err;
            });
        }

        if (OnlineMode.isHost) {
            if (roomInput) roomInput.style.display = 'none';
            if (joinBtn) joinBtn.style.display = 'none';

            OnlineMode.peer = new Peer();
            OnlineMode.peer.on('open', function (id) {
                if (roomDisplay) roomDisplay.textContent = id;
                if (status) status.textContent = 'Waiting for opponent...';
            });
            OnlineMode.peer.on('error', function (err) {
                if (status) status.textContent = 'Error: ' + err.type;
            });
            OnlineMode.peer.on('connection', function (connection) {
                OnlineMode.conn = connection;
                setupConn();
            });
        } else {
            if (roomDisplay) roomDisplay.style.display = 'none';
            if (status) status.textContent = 'Enter host room ID:';

            joinBtn.addEventListener('click', function () {
                const hostId = roomInput.value.trim();
                if (!hostId) return;
                if (status) status.textContent = 'Connecting...';

                OnlineMode.peer = new Peer();
                OnlineMode.peer.on('open', function () {
                    OnlineMode.conn = OnlineMode.peer.connect(hostId);
                    setupConn();
                });
                OnlineMode.peer.on('error', function (err) {
                    if (status) status.textContent = 'Error: ' + err.type;
                });
            });
        }
    });
})();
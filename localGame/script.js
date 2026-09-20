document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.grid-cell');

    const instructionText = document.getElementById('instruction-text');
    const currentPieceIcon = document.getElementById('current-piece-icon');
    const piecesCounterDisplay = document.getElementById('pieces-counter');
    const doneButton = document.getElementById('done-button');
    const turnScreen = document.getElementById('turn-screen');
    const valueSelector = document.getElementById('value-selector');

    const params = new URLSearchParams(window.location.search);
    const isVsComputer = params.get('mode') === 'ai';
    const AI_PLAYER = 2;

    let currentPlayer = 1;
    let hasFlag = false;
    let pawnsLeft = 10;
    let isSetupPhase = false;
    let isValuePhase = false;
    let availableValues = [];
    let selectedValue = null;

    let isGamePhase = false;
    let isGameOver = false;
    let gameTimer = null;
    let timeLeft = 5;
    let p1Move = null;
    let p2Move = null;
    let activePieceIndex = null;

    const LOWER_BEATS_HIGHER = true;

    function showTurnScreen(text, callback) {
        turnScreen.textContent = text;
        turnScreen.style.display = 'flex';

        setTimeout(() => {
            turnScreen.style.display = 'none';
            if (callback) callback();
        }, 1000);
    }

    showTurnScreen("Player 1 Turn", () => {
        isSetupPhase = true;
        for (let i = 80; i < 100; i++) {
            cells[i].classList.add('placement-zone-p1');
        }
    });

    // quickDebugSetup();

    function updateSidebarUI() {
        currentPieceIcon.className = 'player-piece-icon';

        if (currentPlayer === 2) {
            currentPieceIcon.classList.add('player2-piece-icon-style');
        }

        if (!hasFlag) {
            instructionText.textContent = "Place a flag!";
            if (currentPlayer === 1) {
                currentPieceIcon.classList.add('flag-icon-style');
            } else {
                currentPieceIcon.classList.add('flag2-icon-style');
            }
            piecesCounterDisplay.textContent = "1";
            doneButton.disabled = true;
        } else {
            instructionText.textContent = "Place pawns!";
            piecesCounterDisplay.textContent = pawnsLeft;

            if (pawnsLeft === 0) {
                doneButton.disabled = false;
            } else {
                doneButton.disabled = true;
            }
        }
    }

    function renderValueButtons() {
        valueSelector.innerHTML = '';
        availableValues.forEach(val => {
            const btn = document.createElement('button');
            btn.classList.add('value-btn');
            btn.textContent = val;
            if (val === selectedValue) btn.classList.add('selected');

            btn.addEventListener('click', () => {
                selectedValue = val;
                renderValueButtons();
            });
            valueSelector.appendChild(btn);
        });

        if (availableValues.length === 0) {
            doneButton.disabled = false;
            instructionText.textContent = "Click DONE!";
        } else {
            doneButton.disabled = true;
            instructionText.textContent = "Assign values!";
        }
    }

    function getValidMoves(index, player) {
        let moves = [];
        const row = Math.floor(index / 10);
        const col = index % 10;
        const dir = player === 1 ? -1 : 1;
        const ownPawnClass = player === 1 ? 'player-placed' : 'player2-placed';
        const ownFlagClass = player === 1 ? 'player-flag-placed' : 'player2-flag-placed';

        let forwardMoves = [];
        const nextRow = row + dir;

        if (nextRow >= 0 && nextRow <= 9) {
            if (col > 0) {
                let target = (nextRow * 10) + (col - 1);
                if (!cells[target].classList.contains(ownPawnClass) && !cells[target].classList.contains(ownFlagClass)) forwardMoves.push(target);
            }

            let targetCenter = (nextRow * 10) + col;
            if (!cells[targetCenter].classList.contains(ownPawnClass) && !cells[targetCenter].classList.contains(ownFlagClass)) forwardMoves.push(targetCenter);

            if (col < 9) {
                let targetRight = (nextRow * 10) + (col + 1);
                if (!cells[targetRight].classList.contains(ownPawnClass) && !cells[targetRight].classList.contains(ownFlagClass)) forwardMoves.push(targetRight);
            }
        }
        if (forwardMoves.length > 0) return forwardMoves;

        if (col > 0) {
            let left = index - 1;
            if (!cells[left].classList.contains(ownPawnClass) && !cells[left].classList.contains(ownFlagClass)) moves.push(left);
        }
        if (col < 9) {
            let right = index + 1;
            if (!cells[right].classList.contains(ownPawnClass) && !cells[right].classList.contains(ownFlagClass)) moves.push(right);
        }

        return moves;
    }

    function clearHighlights() {
        cells.forEach(c => {
            c.classList.remove('selected-piece');
            c.classList.remove('valid-move-target');
        });
    }

    function initGamePhase() {
        isSetupPhase = false;
        isValuePhase = false;
        isGamePhase = true;

        document.getElementById('instruction-text').style.display = 'none';
        document.getElementById('current-piece-icon').style.display = 'none';
        document.getElementById('pieces-counter').style.display = 'none';
        document.getElementById('value-selector').style.display = 'none';
        document.getElementById('done-button').style.display = 'none';
        document.querySelector('.sidebar').style.display = 'flex';

        document.getElementById('game-status').style.display = 'block';
        document.getElementById('timer-display').style.display = 'block';

        startPreMoveTurn(1);
    }

    function startPreMoveTurn(player) {
        if (isGameOver) return;

        if (isVsComputer && player === AI_PLAYER) {
            currentPlayer = AI_PLAYER;
            activePieceIndex = null;
            clearHighlights();

            showTurnScreen("Player 2 Turn", () => {
                document.getElementById('game-status').textContent = "Player 2's Turn";
                document.getElementById('game-status').style.color = '#333';

                setTimeout(() => {
                    p2Move = getAIMove();
                    resolveTurn();
                }, 100);
            });
            return;
        }

        currentPlayer = player;
        activePieceIndex = null;
        clearHighlights();

        showTurnScreen(`Player ${player} Turn`, () => {
            document.getElementById('game-status').textContent = `Player ${player}'s Turn`;
            document.getElementById('game-status').style.color = player === 1 ? '#0d92f4' : '#f95454';

            timeLeft = 10;
            document.getElementById('timer-display').textContent = `Time Left: ${timeLeft}s`;

            gameTimer = setInterval(() => {
                timeLeft--;
                document.getElementById('timer-display').textContent = `Time Left: ${timeLeft}s`;

                if (timeLeft <= 0) {
                    clearInterval(gameTimer);

                    if (player === 1) {
                        p1Move = null;
                        startPreMoveTurn(2);
                    } else {
                        p2Move = null;
                        resolveTurn();
                    }
                }
            }, 1000);
        });
    }

    function getPieceData(index) {
        const cell = cells[index];

        if (cell.classList.contains('player-flag-placed')) {
            return { player: 1, type: 'flag', value: null };
        }
        if (cell.classList.contains('player2-flag-placed')) {
            return { player: 2, type: 'flag', value: null };
        }
        if (cell.classList.contains('player-placed')) {
            return { player: 1, type: 'pawn', value: parseInt(cell.dataset.value) };
        }
        if (cell.classList.contains('player2-placed')) {
            return { player: 2, type: 'pawn', value: parseInt(cell.dataset.value) };
        }

        return null;
    }

    function removePiece(index) {
        const cell = cells[index];

        cell.classList.remove(
            'player-placed',
            'player2-placed',
            'player-flag-placed',
            'player2-flag-placed',
            'hidden-value',
            'selected-piece',
            'valid-move-target'
        );

        delete cell.dataset.value;
        cell.textContent = '';
    }

    function placePiece(index, player, value, revealed = false) {
        const cell = cells[index];

        removePiece(index);

        const ownClass = player === 1 ? 'player-placed' : 'player2-placed';
        cell.classList.add(ownClass);
        cell.dataset.value = value;

        if (revealed) {
            cell.classList.remove('hidden-value');
            cell.textContent = value;
        } else {
            cell.classList.add('hidden-value');
            cell.textContent = '';
        }
    }

    function revealPiece(index) {
        const cell = cells[index];

        if (cell.dataset.value) {
            cell.classList.remove('hidden-value');
            cell.textContent = cell.dataset.value;
        }
    }

    function compareValues(a, b) {
        if (a === b) return 0;

        if (LOWER_BEATS_HIGHER) {
            if (a === 1 && b === 10) return 1;
            if (a === 10 && b === 1) return -1;
        }

        return a > b ? 1 : -1;
    }

    function logCombat(a, b, result) {
        let text = '';

        if (result > 0) {
            text = `P${a.player}(${a.value}) wins over P${b.player}(${b.value})`;
        } else if (result < 0) {
            text = `P${b.player}(${b.value}) wins over P${a.player}(${a.value})`;
        } else {
            text = `Tie: P${a.player}(${a.value}) vs P${b.player}(${b.value})`;
        }

        document.getElementById('game-status').textContent = text;
    }

    function showGameOver(winner, reason = '') {
        isGameOver = true;
        isGamePhase = false;
        clearInterval(gameTimer);
        clearHighlights();

        if (winner) {
            turnScreen.textContent = `Player ${winner} Wins!`;
            document.getElementById('game-status').textContent = `Player ${winner} wins! ${reason}`;
        } else {
            turnScreen.textContent = `Draw!`;
            document.getElementById('game-status').textContent = `Draw! ${reason}`;
        }

        turnScreen.style.display = 'flex';
    }

    function resolveTurn() {
        clearHighlights();

        showTurnScreen("Resolving Turn...", () => {
            let p1Data = null;
            let p2Data = null;

            if (p1Move) {
                const d = getPieceData(p1Move.from);
                if (d && d.type === 'pawn') {
                    p1Data = {
                        player: 1,
                        value: d.value,
                        from: p1Move.from,
                        to: p1Move.to
                    };
                }
            }

            if (p2Move) {
                const d = getPieceData(p2Move.from);
                if (d && d.type === 'pawn') {
                    p2Data = {
                        player: 2,
                        value: d.value,
                        from: p2Move.from,
                        to: p2Move.to
                    };
                }
            }

            if (p1Data && p2Data) {
                const t1 = getPieceData(p1Data.to);
                const t2 = getPieceData(p2Data.to);

                if (t1 && t2 && t1.type === 'flag' && t2.type === 'flag') {
                    removePiece(p1Data.to);
                    removePiece(p2Data.to);
                    showGameOver(null, "Both players captured each other's flags simultaneously!");
                    p1Move = null;
                    p2Move = null;
                    return;
                }
            }

            if (p1Data) removePiece(p1Data.from);
            if (p2Data) removePiece(p2Data.from);

            if (
                p1Data && p2Data &&
                p1Data.to === p2Data.from &&
                p2Data.to === p1Data.from
            ) {
                const result = compareValues(p1Data.value, p2Data.value);
                logCombat(p1Data, p2Data, result);

                if (result > 0) {
                    placePiece(p1Data.to, 1, p1Data.value, true);
                } else if (result < 0) {
                    placePiece(p2Data.to, 2, p2Data.value, true);
                }

                p1Move = null;
                p2Move = null;
                finishTurn();
                return;
            }

            if (p1Data && p2Data && p1Data.to === p2Data.to) {
                const dest = p1Data.to;
                const result = compareValues(p1Data.value, p2Data.value);
                logCombat(p1Data, p2Data, result);

                if (result > 0) {
                    placePiece(dest, 1, p1Data.value, true);
                } else if (result < 0) {
                    placePiece(dest, 2, p2Data.value, true);
                } else {
                    removePiece(dest);
                }

                p1Move = null;
                p2Move = null;
                finishTurn();
                return;
            }

            let ended = false;

            if (p1Data) {
                ended = resolveSingleMove(p1Data);
            }

            if (!ended && p2Data) {
                ended = resolveSingleMove(p2Data);
            }

            p1Move = null;
            p2Move = null;

            if (!ended) {
                finishTurn();
            }
        });
    }

    function finishTurn() {
        p1Move = null;
        p2Move = null;

        setTimeout(() => {
            if (!isGameOver) {
                startPreMoveTurn(1);
            }
        }, 3000);
    }

    function resolveSingleMove(move) {
        const dest = move.to;
        const occupant = getPieceData(dest);

        if (!occupant) {
            placePiece(dest, move.player, move.value, false);
            return false;
        }

        if (occupant.player === move.player) {
            placePiece(dest, move.player, move.value, false);
            return false;
        }

        if (occupant.type === 'flag') {
            removePiece(dest);
            placePiece(dest, move.player, move.value, true);
            showGameOver(move.player, "Captured the opponent's flag!");
            return true;
        }

        if (occupant.type === 'pawn') {
            const result = compareValues(move.value, occupant.value);
            logCombat(move, { player: occupant.player, value: occupant.value }, result);

            if (result > 0) {
                removePiece(dest);
                placePiece(dest, move.player, move.value, true);
            } else if (result < 0) {
                revealPiece(dest);
            } else {
                removePiece(dest);
            }
        }

        return false;
    }

    function quickDebugSetup() {

        cells[94].classList.add('player-flag-placed');
        for (let i = 80; i < 90; i++) {
            cells[i].classList.add('player-placed', 'hidden-value');
            cells[i].dataset.value = i - 79;
            cells[i].textContent = '';
        }

        cells[4].classList.add('player2-flag-placed');
        for (let i = 10; i < 20; i++) {
            cells[i].classList.add('player2-placed', 'hidden-value');
            cells[i].dataset.value = i - 9;
            cells[i].textContent = '';
        }

        initGamePhase();
    }

    //  AI - ISMCTS with UCB1 (Information Set Monte Carlo Tree Search)

    function aiShuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function aiGetMoves(board, player) {
        const moves = [];
        const dir = player === 1 ? -1 : 1;

        for (let i = 0; i < 100; i++) {
            const p = board[i];
            if (!p || p.player !== player || p.type !== 'pawn') continue;

            const row = Math.floor(i / 10);
            const col = i % 10;
            const nr = row + dir;
            const fwd = [];

            if (nr >= 0 && nr <= 9) {
                if (col > 0) {
                    const t = nr * 10 + col - 1;
                    if (!board[t] || board[t].player !== player) fwd.push(t);
                }
                const tc = nr * 10 + col;
                if (!board[tc] || board[tc].player !== player) fwd.push(tc);
                if (col < 9) {
                    const t = nr * 10 + col + 1;
                    if (!board[t] || board[t].player !== player) fwd.push(t);
                }
            }

            if (fwd.length) {
                fwd.forEach(t => moves.push({ from: i, to: t }));
            } else {
                if (col > 0) {
                    const t = i - 1;
                    if (!board[t] || board[t].player !== player) moves.push({ from: i, to: t });
                }
                if (col < 9) {
                    const t = i + 1;
                    if (!board[t] || board[t].player !== player) moves.push({ from: i, to: t });
                }
            }
        }
        return moves;
    }

    function aiApplySingleMove(board, move) {
        const dest = move.to;
        const occ = board[dest];

        if (!occ) {
            board[dest] = { player: move.player, type: 'pawn', value: move.value };
            return null;
        }
        if (occ.player === move.player) {
            board[dest] = { player: move.player, type: 'pawn', value: move.value };
            return null;
        }
        if (occ.type === 'flag') {
            board[dest] = { player: move.player, type: 'pawn', value: move.value };
            return move.player;
        }

        const cmp = compareValues(move.value, occ.value);
        if (cmp > 0) {
            board[dest] = { player: move.player, type: 'pawn', value: move.value };
        } else if (cmp < 0) {
            board[dest] = { player: occ.player, type: 'pawn', value: occ.value };
        } else {
            board[dest] = null;
        }
        return null;
    }

    function aiApplyMoves(board, p1, p2) {
        let m1 = null, m2 = null;

        if (p1 && board[p1.from] && board[p1.from].type === 'pawn') {
            m1 = { player: 1, value: board[p1.from].value, from: p1.from, to: p1.to };
        }
        if (p2 && board[p2.from] && board[p2.from].type === 'pawn') {
            m2 = { player: 2, value: board[p2.from].value, from: p2.from, to: p2.to };
        }

        if (m1 && m2) {
            const t1 = board[m1.to], t2 = board[m2.to];
            if (t1 && t2 && t1.type === 'flag' && t1.player === 2 &&
                t2.type === 'flag' && t2.player === 1) {
                board[m1.to] = null;
                board[m2.to] = null;
                return { ended: true, winner: null };
            }
        }

        if (m1) board[m1.from] = null;
        if (m2) board[m2.from] = null;

        if (m1 && m2 && m1.to === m2.from && m2.to === m1.from) {
            const cmp = compareValues(m1.value, m2.value);
            if (cmp > 0) board[m1.to] = { player: 1, type: 'pawn', value: m1.value };
            else if (cmp < 0) board[m2.to] = { player: 2, type: 'pawn', value: m2.value };
            return { ended: false, winner: null };
        }

        if (m1 && m2 && m1.to === m2.to) {
            const cmp = compareValues(m1.value, m2.value);
            if (cmp > 0) board[m1.to] = { player: 1, type: 'pawn', value: m1.value };
            else if (cmp < 0) board[m2.to] = { player: 2, type: 'pawn', value: m2.value };
            return { ended: false, winner: null };
        }

        if (m1) {
            const w = aiApplySingleMove(board, m1);
            if (w !== null) return { ended: true, winner: w };
        }
        if (m2) {
            const w = aiApplySingleMove(board, m2);
            if (w !== null) return { ended: true, winner: w };
        }
        return { ended: false, winner: null };
    }

    function aiDeterminize(board) {
        const out = board.map(p => p ? { player: p.player, type: p.type, value: p.value } : null);
        const used = new Set();
        const hidden = [];

        for (let i = 0; i < 100; i++) {
            const p = out[i];
            if (!p || p.type !== 'pawn') continue;
            if (typeof p.value === 'number' && !isNaN(p.value)) used.add(p.value);
            else hidden.push(i);
        }

        const avail = [];
        for (let v = 1; v <= 10; v++) if (!used.has(v)) avail.push(v);
        aiShuffle(avail);

        hidden.forEach((idx, k) => {
            out[idx].value = avail[k] !== undefined ? avail[k] : 1;
        });
        return out;
    }

    function aiRandomMove(board, player) {
        const moves = aiGetMoves(board, player);
        if (!moves.length) return null;
        return moves[(Math.random() * moves.length) | 0];
    }

    function aiPlayout(board, aiPlayer, maxSteps) {
        maxSteps = maxSteps || 120;
        for (let s = 0; s < maxSteps; s++) {
            const m1 = aiRandomMove(board, 1);
            const m2 = aiRandomMove(board, 2);
            if (!m1 && !m2) break;

            const r = aiApplyMoves(board, m1, m2);
            if (r.ended) {
                if (r.winner === null) return 0;
                return r.winner === aiPlayer ? 1 : -1;
            }
        }
        return 0;
    }

    function aiEvaluate(board, aiPlayer) {
        const opp = aiPlayer === 1 ? 2 : 1;
        let score = 0;
        let aiPawns = 0, oppPawns = 0, aiVal = 0, oppVal = 0;
        let aiFlag = -1, oppFlag = -1;

        for (let i = 0; i < 100; i++) {
            const p = board[i];
            if (!p) continue;
            if (p.player === aiPlayer) {
                if (p.type === 'flag') aiFlag = i;
                else {
                    aiPawns++;
                    aiVal += (typeof p.value === 'number' && !isNaN(p.value)) ? p.value : 5;
                }
            } else {
                if (p.type === 'flag') oppFlag = i;
                else {
                    oppPawns++;
                    oppVal += (typeof p.value === 'number' && !isNaN(p.value)) ? p.value : 5;
                }
            }
        }

        score += (aiPawns - oppPawns) * 10;
        score += (aiVal - oppVal) * 1.0;

        if (oppFlag >= 0) {
            const fr = Math.floor(oppFlag / 10), fc = oppFlag % 10;
            for (let i = 0; i < 100; i++) {
                const p = board[i];
                if (!p || p.player !== aiPlayer || p.type !== 'pawn') continue;
                const d = Math.abs(Math.floor(i / 10) - fr) + Math.abs((i % 10) - fc);
                score += (10 - d) * 2;
            }
        }

        if (aiFlag >= 0) {
            const fr = Math.floor(aiFlag / 10), fc = aiFlag % 10;
            for (let i = 0; i < 100; i++) {
                const p = board[i];
                if (!p || p.player !== aiPlayer || p.type !== 'pawn') continue;
                const d = Math.abs(Math.floor(i / 10) - fr) + Math.abs((i % 10) - fc);
                if (d <= 3) score += (4 - d) * 4;
            }
        }

        return score;
    }

    function aiSelectUCB1(stats, totalPlays, C) {
        let best = null, bestU = -Infinity;
        for (const s of stats) {
            if (s.plays === 0) return s;
            const u = (s.wins / s.plays) + C * Math.sqrt(Math.log(totalPlays) / s.plays);
            if (u > bestU) {
                bestU = u;
                best = s;
            }
        }
        return best;
    }

    function aiSearch(board, aiPlayer, options) {
        options = options || {};
        const timeLimit = options.timeLimitMs || 1500;
        const maxSims = options.simulations || 4000;
        const C = options.C || 1.4;

        const moves = aiGetMoves(board, aiPlayer);
        if (!moves.length) return null;

        const stats = moves.map(m => ({ move: m, wins: 0, plays: 0, h: 0 }));

        for (const s of stats) {
            const tmp = board.map(p => p ? { player: p.player, type: p.type, value: p.value } : null);
            aiApplyMoves(tmp, aiPlayer === 1 ? s.move : null, aiPlayer === 2 ? s.move : null);
            s.h = aiEvaluate(tmp, aiPlayer);
        }

        const now = () => (typeof performance !== 'undefined' && performance.now)
            ? performance.now()
            : Date.now();

        const start = now();
        let total = 0, sims = 0;

        while (sims < maxSims && now() - start < timeLimit) {
            const chosen = aiSelectUCB1(stats, total, C);
            if (!chosen) break;

            const det = aiDeterminize(board);

            const r1 = aiApplyMoves(
                det,
                aiPlayer === 1 ? chosen.move : null,
                aiPlayer === 2 ? chosen.move : null
            );

            let result;
            if (r1.ended) {
                result = r1.winner === aiPlayer ? 1 : (r1.winner === null ? 0 : -1);
            } else {
                const oppPlayer = aiPlayer === 1 ? 2 : 1;
                const oppMove = aiRandomMove(det, oppPlayer);
                const r2 = aiApplyMoves(
                    det,
                    aiPlayer === 1 ? null : oppMove,
                    aiPlayer === 2 ? null : oppMove
                );
                if (r2.ended) {
                    result = r2.winner === aiPlayer ? 1 : (r2.winner === null ? 0 : -1);
                } else {
                    result = aiPlayout(det, aiPlayer, 120);
                }
            }

            const reward = (result + 1) / 2;
            chosen.wins += reward;
            chosen.plays++;
            total++;
            sims++;
        }

        let best = null, bestScore = -Infinity;
        for (const s of stats) {
            if (s.plays === 0) continue;
            const score = (s.wins / s.plays) + (s.h / 1000) * 0.2;
            if (score > bestScore) {
                bestScore = score;
                best = s.move;
            }
        }
        return best || moves[0];
    }

    function extractBoardForAI(aiPlayer) {
        const board = new Array(100).fill(null);

        for (let i = 0; i < 100; i++) {
            const cell = cells[i];
            const hidden = cell.classList.contains('hidden-value');

            if (cell.classList.contains('player-placed')) {
                const known = (aiPlayer === 1) || !hidden;
                board[i] = { player: 1, type: 'pawn', value: known ? parseInt(cell.dataset.value) : null };
            } else if (cell.classList.contains('player2-placed')) {
                const known = (aiPlayer === 2) || !hidden;
                board[i] = { player: 2, type: 'pawn', value: known ? parseInt(cell.dataset.value) : null };
            } else if (cell.classList.contains('player-flag-placed')) {
                board[i] = { player: 1, type: 'flag', value: null };
            } else if (cell.classList.contains('player2-flag-placed')) {
                board[i] = { player: 2, type: 'flag', value: null };
            }
        }
        return board;
    }

    function getAIMove() {
        const board = extractBoardForAI(AI_PLAYER);
        return aiSearch(board, AI_PLAYER, {
            simulations: 4000,
            timeLimitMs: 1500,
            C: 1.4
        });
    }

    function setupAI() {
        const flagIdx = Math.floor(Math.random() * 10);
        const flagCol = flagIdx % 10;
        cells[flagIdx].classList.add('player2-flag-placed');

        const candidates = [];
        for (let i = 0; i < 20; i++) {
            if (i !== flagIdx) candidates.push(i);
        }

        candidates.sort((a, b) => {
            const ar = Math.floor(a / 10), ac = a % 10;
            const br = Math.floor(b / 10), bc = b % 10;
            return (ar * 20 + Math.abs(ac - flagCol)) - (br * 20 + Math.abs(bc - flagCol));
        });

        const chosen = candidates.slice(0, 10);
        const values = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

        chosen.forEach((idx, k) => {
            cells[idx].classList.add('player2-placed', 'hidden-value');
            cells[idx].dataset.value = values[k];
            cells[idx].textContent = '';
        });
    }

    cells.forEach((cell, i) => {
        cell.addEventListener('click', function () {
            if (isGameOver) return;
            if (isVsComputer && currentPlayer === AI_PLAYER) return;

            if (isSetupPhase) {
                const isP1Zone = i >= 80 && i <= 99;
                const isP2Zone = i >= 0 && i <= 19;

                if (currentPlayer === 1 && !isP1Zone) return;
                if (currentPlayer === 2 && !isP2Zone) return;

                const flagClass = currentPlayer === 1 ? 'player-flag-placed' : 'player2-flag-placed';
                const pawnClass = currentPlayer === 1 ? 'player-placed' : 'player2-placed';

                if (this.classList.contains(flagClass)) {
                    this.classList.remove(flagClass);
                    hasFlag = false;
                    updateSidebarUI();
                    return;
                }

                if (this.classList.contains(pawnClass)) {
                    this.classList.remove(pawnClass);
                    pawnsLeft++;
                    updateSidebarUI();
                    return;
                }

                if (!hasFlag) {
                    const isValidFlagP1 = currentPlayer === 1 && i >= 90 && i <= 99;
                    const isValidFlagP2 = currentPlayer === 2 && i >= 0 && i <= 9;

                    if (isValidFlagP1 || isValidFlagP2) {
                        this.classList.add(flagClass);
                        hasFlag = true;
                        updateSidebarUI();
                    } else {
                        alert("You can place a flag only in your first row!");
                    }
                } else {
                    if (pawnsLeft > 0) {
                        this.classList.add(pawnClass);
                        pawnsLeft--;
                        updateSidebarUI();
                    }
                }
            }
            else if (isValuePhase) {
                const pawnClass = currentPlayer === 1 ? 'player-placed' : 'player2-placed';

                if (this.classList.contains(pawnClass) && !this.dataset.value && selectedValue !== null) {
                    this.dataset.value = selectedValue;
                    this.textContent = selectedValue;

                    availableValues = availableValues.filter(v => v !== selectedValue);
                    selectedValue = null;
                    renderValueButtons();
                }
                else if (this.classList.contains(pawnClass) && this.dataset.value) {
                    const val = parseInt(this.dataset.value);
                    availableValues.push(val);
                    availableValues.sort((a, b) => a - b);

                    delete this.dataset.value;
                    this.textContent = '';
                    renderValueButtons();
                }
            }

            else if (isGamePhase) {
                const pawnClass = currentPlayer === 1 ? 'player-placed' : 'player2-placed';

                if (this.classList.contains(pawnClass)) {
                    clearHighlights();
                    activePieceIndex = i;
                    this.classList.add('selected-piece');

                    const validMoves = getValidMoves(i, currentPlayer);
                    validMoves.forEach(moveIdx => {
                        cells[moveIdx].classList.add('valid-move-target');
                    });
                }

                else if (this.classList.contains('valid-move-target') && activePieceIndex !== null) {
                    clearInterval(gameTimer);

                    if (currentPlayer === 1) {
                        p1Move = { from: activePieceIndex, to: i };
                        startPreMoveTurn(2);
                    } else {
                        p2Move = { from: activePieceIndex, to: i };
                        resolveTurn();
                    }
                }
            }
        });
    });

    doneButton.addEventListener('click', () => {
        doneButton.disabled = true;

        if (isSetupPhase) {
            isSetupPhase = false;
            isValuePhase = true;
            availableValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            selectedValue = null;

            currentPieceIcon.style.display = 'none';
            piecesCounterDisplay.style.display = 'none';
            valueSelector.style.display = 'flex';

            renderValueButtons();
        }
        else if (isValuePhase) {
            isValuePhase = false;

            const pawnClass = currentPlayer === 1 ? 'player-placed' : 'player2-placed';
            document.querySelectorAll('.' + pawnClass).forEach(cell => {
                cell.classList.add('hidden-value');
                cell.textContent = '';
            });

            let flagPosition = null;
            let playerPawnsPositions = [];

            if (currentPlayer === 1) {
                for (let i = 80; i < 100; i++) {
                    cells[i].classList.remove('placement-zone-p1');

                    if (cells[i].classList.contains('player-flag-placed')) {
                        flagPosition = i;
                    } else if (cells[i].classList.contains('player-placed')) {
                        playerPawnsPositions.push({ index: i, value: cells[i].dataset.value });
                    }
                }

                console.log("Player 1 - Flag position:", flagPosition);
                console.log("Player 1 - Pawns data:", playerPawnsPositions);

                if (isVsComputer) {
                    setupAI();
                    showTurnScreen("Game Start!", () => {
                        initGamePhase();
                    });
                    return;
                }

                currentPlayer = 2;
                hasFlag = false;
                pawnsLeft = 10;

                currentPieceIcon.style.display = 'block';
                piecesCounterDisplay.style.display = 'block';
                valueSelector.style.display = 'none';

                showTurnScreen("Player 2 Turn", () => {
                    doneButton.textContent = "DONE";
                    doneButton.style.backgroundColor = "#4CAF50";
                    updateSidebarUI();

                    for (let i = 0; i < 20; i++) {
                        cells[i].classList.add('placement-zone-p2');
                    }

                    isSetupPhase = true;
                });

            } else {
                for (let i = 0; i < 20; i++) {
                    cells[i].classList.remove('placement-zone-p2');

                    if (cells[i].classList.contains('player2-flag-placed')) {
                        flagPosition = i;
                    } else if (cells[i].classList.contains('player2-placed')) {
                        playerPawnsPositions.push({ index: i, value: cells[i].dataset.value });
                    }
                }

                console.log("Player 2 - Flag position:", flagPosition);
                console.log("Player 2 - Pawns data:", playerPawnsPositions);

                showTurnScreen("Game Start!", () => {
                    initGamePhase();
                });
            }
        }
    });
});
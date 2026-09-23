(function (global) {
    'use strict';

    const SIZE = 10;
    const CELL_COUNT = SIZE * SIZE;
    const LOWER_BEATS_HIGHER = true;

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function cloneBoard(board) {
        const out = new Array(CELL_COUNT);
        for (let i = 0; i < CELL_COUNT; i++) {
            out[i] = board[i] ? {
                player: board[i].player,
                type: board[i].type,
                value: board[i].value
            } : null;
        }
        return out;
    }

    function compareValues(a, b) {
        if (a === b) return 0;
        if (LOWER_BEATS_HIGHER) {
            if (a === 1 && b === 10) return 1;
            if (a === 10 && b === 1) return -1;
        }
        return a > b ? 1 : -1;
    }

    function getMoves(board, player) {
        const moves = [];
        const dir = player === 1 ? -1 : 1;

        for (let i = 0; i < CELL_COUNT; i++) {
            const piece = board[i];
            if (!piece || piece.player !== player || piece.type !== 'pawn') continue;

            const row = Math.floor(i / SIZE);
            const col = i % SIZE;
            const nextRow = row + dir;
            const forward = [];

            if (nextRow >= 0 && nextRow <= 9) {
                if (col > 0) {
                    const t = nextRow * SIZE + (col - 1);
                    if (!board[t] || board[t].player !== player) forward.push(t);
                }
                const tc = nextRow * SIZE + col;
                if (!board[tc] || board[tc].player !== player) forward.push(tc);
                if (col < 9) {
                    const tr = nextRow * SIZE + (col + 1);
                    if (!board[tr] || board[tr].player !== player) forward.push(tr);
                }
            }

            if (forward.length > 0) {
                forward.forEach(t => moves.push({ from: i, to: t }));
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

    function applyMoves(board, move1, move2) {
        let p1 = null, p2 = null;

        if (move1 && board[move1.from] && board[move1.from].type === 'pawn') {
            p1 = {
                player: 1,
                value: board[move1.from].value,
                from: move1.from,
                to: move1.to
            };
        }
        if (move2 && board[move2.from] && board[move2.from].type === 'pawn') {
            p2 = {
                player: 2,
                value: board[move2.from].value,
                from: move2.from,
                to: move2.to
            };
        }

        if (p1 && p2) {
            const t1 = board[p1.to];
            const t2 = board[p2.to];
            const p1HitsEnemyFlag = t1 && t1.type === 'flag' && t1.player === 2;
            const p2HitsEnemyFlag = t2 && t2.type === 'flag' && t2.player === 1;
            if (p1HitsEnemyFlag && p2HitsEnemyFlag) {
                board[p1.to] = null;
                board[p2.to] = null;
                return { ended: true, winner: null };
            }
        }

        if (p1) board[p1.from] = null;
        if (p2) board[p2.from] = null;

        if (p1 && p2 && p1.to === p2.from && p2.to === p1.from) {
            const cmp = compareValues(p1.value, p2.value);
            if (cmp > 0) {
                board[p1.to] = { player: 1, type: 'pawn', value: p1.value };
            } else if (cmp < 0) {
                board[p2.to] = { player: 2, type: 'pawn', value: p2.value };
            }
            return { ended: false, winner: null };
        }

        if (p1 && p2 && p1.to === p2.to) {
            const cmp = compareValues(p1.value, p2.value);
            if (cmp > 0) {
                board[p1.to] = { player: 1, type: 'pawn', value: p1.value };
            } else if (cmp < 0) {
                board[p2.to] = { player: 2, type: 'pawn', value: p2.value };
            }
            return { ended: false, winner: null };
        }

        let ended = false;
        let winner = null;
        if (p1) {
            const r = applySingleMove(board, p1);
            if (r.ended) { ended = true; winner = r.winner; }
        }
        if (!ended && p2) {
            const r = applySingleMove(board, p2);
            if (r.ended) { ended = true; winner = r.winner; }
        }
        return { ended, winner };
    }

    function applySingleMove(board, move) {
        const dest = move.to;
        const occ = board[dest];

        if (!occ) {
            board[dest] = { player: move.player, type: 'pawn', value: move.value };
            return { ended: false };
        }
        if (occ.player === move.player) {
            board[dest] = { player: move.player, type: 'pawn', value: move.value };
            return { ended: false };
        }
        if (occ.type === 'flag') {
            board[dest] = { player: move.player, type: 'pawn', value: move.value };
            return { ended: true, winner: move.player };
        }
        if (occ.type === 'pawn') {
            const cmp = compareValues(move.value, occ.value);
            if (cmp > 0) {
                board[dest] = { player: move.player, type: 'pawn', value: move.value };
            } else if (cmp < 0) {
                board[dest] = { player: occ.player, type: 'pawn', value: occ.value };
            } else {
                board[dest] = null;
            }
        }
        return { ended: false };
    }

    function determinize(board) {
        const out = cloneBoard(board);

        const usedValues = new Set();
        const hiddenIndices = [];

        for (let i = 0; i < CELL_COUNT; i++) {
            const p = out[i];
            if (!p || p.type !== 'pawn') continue;
            if (typeof p.value === 'number' && !isNaN(p.value)) {
                usedValues.add(p.value);
            } else {
                hiddenIndices.push(i);
            }
        }

        const available = [];
        for (let v = 1; v <= 10; v++) {
            if (!usedValues.has(v)) available.push(v);
        }
        shuffle(available);

        hiddenIndices.forEach((idx, k) => {
            out[idx].value = available[k] !== undefined ? available[k] : 1;
        });

        return out;
    }

    function randomMove(board, player) {
        const moves = getMoves(board, player);
        if (moves.length === 0) return null;
        return moves[(Math.random() * moves.length) | 0];
    }

    function playout(board, aiPlayer, maxSteps) {
        maxSteps = maxSteps || 150;
        for (let step = 0; step < maxSteps; step++) {
            const m1 = randomMove(board, 1);
            const m2 = randomMove(board, 2);
            if (!m1 && !m2) break;
            const r = applyMoves(board, m1, m2);
            if (r.ended) {
                if (r.winner === null) return 0;
                return r.winner === aiPlayer ? 1 : -1;
            }
        }
        return 0;
    }

    function evaluate(board, aiPlayer) {
        const opponent = aiPlayer === 1 ? 2 : 1;
        let score = 0;

        let aiPawns = 0, oppPawns = 0;
        let aiValue = 0, oppValue = 0;
        let aiFlag = -1, oppFlag = -1;

        for (let i = 0; i < CELL_COUNT; i++) {
            const p = board[i];
            if (!p) continue;
            if (p.player === aiPlayer) {
                if (p.type === 'flag') aiFlag = i;
                else {
                    aiPawns++;
                    aiValue += (typeof p.value === 'number' && !isNaN(p.value)) ? p.value : 5;
                }
            } else {
                if (p.type === 'flag') oppFlag = i;
                else {
                    oppPawns++;
                    oppValue += (typeof p.value === 'number' && !isNaN(p.value)) ? p.value : 5;
                }
            }
        }

        score += (aiPawns - oppPawns) * 12;
        score += (aiValue - oppValue) * 1.2;

        if (oppFlag >= 0) {
            const fr = Math.floor(oppFlag / SIZE);
            const fc = oppFlag % SIZE;
            for (let i = 0; i < CELL_COUNT; i++) {
                const p = board[i];
                if (!p || p.player !== aiPlayer || p.type !== 'pawn') continue;
                const r = Math.floor(i / SIZE);
                const c = i % SIZE;
                const d = Math.abs(r - fr) + Math.abs(c - fc);
                score += (10 - d) * 2.5;
            }
        }

        if (aiFlag >= 0) {
            const fr = Math.floor(aiFlag / SIZE);
            const fc = aiFlag % SIZE;
            for (let i = 0; i < CELL_COUNT; i++) {
                const p = board[i];
                if (!p || p.player !== aiPlayer || p.type !== 'pawn') continue;
                const r = Math.floor(i / SIZE);
                const c = i % SIZE;
                const d = Math.abs(r - fr) + Math.abs(c - fc);
                if (d <= 3) score += (4 - d) * 4;
            }
        }

        return score;
    }

    function selectUCB1(stats, totalPlays, C) {
        C = C || 1.4;
        let best = null;
        let bestUCB = -Infinity;

        for (let k = 0; k < stats.length; k++) {
            const s = stats[k];
            if (s.plays === 0) return s;
            const exploit = s.wins / s.plays;
            const explore = C * Math.sqrt(Math.log(totalPlays) / s.plays);
            const ucb = exploit + explore;
            if (ucb > bestUCB) {
                bestUCB = ucb;
                best = s;
            }
        }
        return best;
    }

    function searchBestMove(board, aiPlayer, options) {
        options = options || {};
        const timeLimitMs = options.timeLimitMs || 1200;
        const maxSimulations = options.simulations || 3000;
        const C = options.C || 1.4;

        const moves = getMoves(board, aiPlayer);
        if (moves.length === 0) return null;

        const stats = moves.map(m => ({
            move: m,
            wins: 0,
            plays: 0,
            heuristic: 0
        }));

        for (const s of stats) {
            const tmp = cloneBoard(board);
            applyMoves(
                tmp,
                aiPlayer === 1 ? s.move : null,
                aiPlayer === 2 ? s.move : null
            );
            s.heuristic = evaluate(tmp, aiPlayer);
        }

        const startTime = (typeof performance !== 'undefined' && performance.now)
            ? performance.now()
            : Date.now();

        const now = () => (typeof performance !== 'undefined' && performance.now)
            ? performance.now()
            : Date.now();

        let totalPlays = 0;
        let sims = 0;

        while (sims < maxSimulations) {
            if (now() - startTime > timeLimitMs) break;

            const chosen = selectUCB1(stats, totalPlays, C);
            if (!chosen) break;

            const detBoard = determinize(board);

            const r1 = applyMoves(
                detBoard,
                aiPlayer === 1 ? chosen.move : null,
                aiPlayer === 2 ? chosen.move : null
            );

            let result;
            if (r1.ended) {
                result = r1.winner === aiPlayer ? 1 : (r1.winner === null ? 0 : -1);
            } else {
                const oppPlayer = aiPlayer === 1 ? 2 : 1;
                const oppMove = randomMove(detBoard, oppPlayer);
                const r2 = applyMoves(
                    detBoard,
                    aiPlayer === 1 ? null : oppMove,
                    aiPlayer === 2 ? null : oppMove
                );
                if (r2.ended) {
                    result = r2.winner === aiPlayer ? 1 : (r2.winner === null ? 0 : -1);
                } else {
                    result = playout(detBoard, aiPlayer, 150);
                }
            }

            const reward = (result + 1) / 2;
            chosen.wins += reward;
            chosen.plays += 1;
            totalPlays += 1;
            sims += 1;
        }

        let best = null;
        let bestScore = -Infinity;
        for (const s of stats) {
            if (s.plays === 0) continue;
            const winRate = s.wins / s.plays;
            const h = s.heuristic / 800;
            const score = winRate + h * 0.25;
            if (score > bestScore) {
                bestScore = score;
                best = s.move;
            }
        }

        return best || moves[0];
    }

    global.FrontLineAI = {
        SIZE,
        CELL_COUNT,
        getMoves,
        applyMoves,
        compareValues,
        determinize,
        evaluate,
        searchBestMove
    };
})(window);
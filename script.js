document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.grid-cell');

    const instructionText = document.getElementById('instruction-text');
    const currentPieceIcon = document.getElementById('current-piece-icon');
    const piecesCounterDisplay = document.getElementById('pieces-counter');
    const doneButton = document.getElementById('done-button');
    const turnScreen = document.getElementById('turn-screen');
    const valueSelector = document.getElementById('value-selector');

    let currentPlayer = 1;
    let hasFlag = false;
    let pawnsLeft = 10;
    let isSetupPhase = false;
    let isValuePhase = false;
    let availableValues = [];
    let selectedValue = null;

    let isGamePhase = false;
    let gameTimer = null;
    let timeLeft = 5;
    let p1Move = null;
    let p2Move = null;
    let activePieceIndex = null;

    function showTurnScreen(text, callback) {
        turnScreen.textContent = text;
        turnScreen.style.display = 'flex';

        setTimeout(() => {
            turnScreen.style.display = 'none';
            if (callback) callback();
        }, 1000);
    }

    // showTurnScreen("Player 1 Turn", () => {
    //     isSetupPhase = true;
    //     for (let i = 80; i < 100; i++) {
    //         cells[i].classList.add('placement-zone-p1');
    //     }
    // });

    quickDebugSetup();

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

    function resolveTurn() {
        clearHighlights();

        showTurnScreen("Resolving Turn...", () => {
            let p1Data = null;
            let p2Data = null;

            if (p1Move) {
                const cell = cells[p1Move.from];
                p1Data = { value: cell.dataset.value, to: p1Move.to };
                cell.classList.remove('player-placed', 'hidden-value');
                delete cell.dataset.value;
            }
            if (p2Move) {
                const cell = cells[p2Move.from];
                p2Data = { value: cell.dataset.value, to: p2Move.to };
                cell.classList.remove('player2-placed', 'hidden-value');
                delete cell.dataset.value;
            }

            if (p1Data && p2Data && p1Data.to === p2Data.to) {
                // Handle collision, now P1 wins
                placePiece(p1Data.to, 1, p1Data.value);
            } else {
                if (p1Data) placePiece(p1Data.to, 1, p1Data.value);
                if (p2Data) placePiece(p2Data.to, 2, p2Data.value);
            }

            p1Move = null;
            p2Move = null;

            setTimeout(() => {
                startPreMoveTurn(1);
            }, 3000);
        });
    }

    function placePiece(index, player, value) {
        const cell = cells[index];
        const ownClass = player === 1 ? 'player-placed' : 'player2-placed';
        const enemyClass = player === 1 ? 'player2-placed' : 'player-placed';

        if (cell.classList.contains(enemyClass)) {
            cell.classList.remove(enemyClass);
        }

        cell.classList.add(ownClass);
        cell.classList.add('hidden-value');
        cell.dataset.value = value;
        cell.textContent = '';
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

    cells.forEach((cell, i) => {
        cell.addEventListener('click', function () {
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
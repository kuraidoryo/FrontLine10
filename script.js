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

    function showTurnScreen(text, callback) {
        turnScreen.textContent = text;
        turnScreen.style.display = 'flex';
        
        setTimeout(() => {
            turnScreen.style.display = 'none';
            if (callback) callback();
        }, 2000);
    }

    showTurnScreen("Player 1 Turn", () => {
        isSetupPhase = true;
        for (let i = 80; i < 100; i++) {
            cells[i].classList.add('placement-zone-p1');
        }
    });

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

    cells.forEach((cell, i) => {
        cell.addEventListener('click', function() {
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

                document.querySelector('.sidebar').style.display = 'none';
                
                showTurnScreen("Game Start!", () => {
                    // Start the real game here
                });
            }
        }
    });
});
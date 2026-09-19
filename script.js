document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.grid-cell');
    
    const instructionText = document.getElementById('instruction-text');
    const currentPieceIcon = document.getElementById('current-piece-icon');
    const piecesCounterDisplay = document.getElementById('pieces-counter');
    const doneButton = document.getElementById('done-button');
    const turnScreen = document.getElementById('turn-screen');
    
    let currentPlayer = 1;
    let hasFlag = false; 
    let pawnsLeft = 10;  
    let isSetupPhase = false;

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

    cells.forEach((cell, i) => {
        cell.addEventListener('click', function() {
            if (!isSetupPhase) return;

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
        });
    });

    doneButton.addEventListener('click', () => {
        doneButton.disabled = true; 

        let flagPosition = null;
        let playerPawnsPositions = []; 

        if (currentPlayer === 1) {
            for (let i = 80; i < 100; i++) {
                cells[i].classList.remove('placement-zone-p1'); 
                
                if (cells[i].classList.contains('player-flag-placed')) {
                    flagPosition = i;
                } else if (cells[i].classList.contains('player-placed')) {
                    playerPawnsPositions.push(i);
                }
            }

            console.log("Player 1 - Flag position:", flagPosition);
            console.log("Player 1 - Pawn positions:", playerPawnsPositions);

            currentPlayer = 2;
            hasFlag = false;
            pawnsLeft = 10;
            isSetupPhase = false;

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
                    playerPawnsPositions.push(i);
                }
            }

            console.log("Player 2 - Flag position:", flagPosition);
            console.log("Player 2 - Pawn positions:", playerPawnsPositions);

            isSetupPhase = false;

            document.querySelector('.sidebar').style.display = 'none';
        }
    });
});
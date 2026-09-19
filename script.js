document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.grid-cell');
    
    const instructionText = document.getElementById('instruction-text');
    const currentPieceIcon = document.getElementById('current-piece-icon');
    const piecesCounterDisplay = document.getElementById('pieces-counter');
    const doneButton = document.getElementById('done-button');
    const turnScreen = document.getElementById('turn-screen');
    
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
    });

    function updateSidebarUI() {
        if (!hasFlag) {
            instructionText.textContent = "Place a flag!";
            currentPieceIcon.classList.add('flag-icon-style');
            piecesCounterDisplay.textContent = "1";
            doneButton.disabled = true;
        } else {
            instructionText.textContent = "Place pawns!";
            currentPieceIcon.classList.remove('flag-icon-style');
            piecesCounterDisplay.textContent = pawnsLeft;
            
            if (pawnsLeft === 0) {
                doneButton.disabled = false;
            } else {
                doneButton.disabled = true;
            }
        }
    }

    for (let i = 80; i < 100; i++) {
        const cell = cells[i];
        cell.classList.add('placement-zone');

        cell.addEventListener('click', function() {
            if (!isSetupPhase) return;

            // Zdejmowanie flagi
            if (this.classList.contains('player-flag-placed')) {
                this.classList.remove('player-flag-placed');
                hasFlag = false;
                updateSidebarUI();
                return;
            }

            // Zdejmowanie pionka
            if (this.classList.contains('player-placed')) {
                this.classList.remove('player-placed');
                pawnsLeft++;
                updateSidebarUI();
                return;
            }

            // Stawianie elementów
            if (!hasFlag) {
                if (i >= 90 && i <= 99) {
                    this.classList.add('player-flag-placed');
                    hasFlag = true;
                    updateSidebarUI();
                } else {
                    alert("You can place a flag only in your first row (at the very bottom)!");
                }
            } else {
                if (pawnsLeft > 0) {
                    this.classList.add('player-placed');
                    pawnsLeft--;
                    updateSidebarUI();
                }
            }
        });
    }

    doneButton.addEventListener('click', () => {
        doneButton.disabled = true; 
        doneButton.textContent = "READY"; 
        doneButton.style.backgroundColor = "#2e7d32";
        instructionText.textContent = "Waiting...";

        let flagPosition = null;
        let playerPawnsPositions = []; 

        for (let i = 80; i < 100; i++) {
            cells[i].classList.remove('placement-zone'); 
            
            if (cells[i].classList.contains('player-flag-placed')) {
                flagPosition = i;
            } else if (cells[i].classList.contains('player-placed')) {
                playerPawnsPositions.push(i);
            }
        }

        console.log("Player 1 - Flag position:", flagPosition);
        console.log("Player 1 - Pawn positions:", playerPawnsPositions);

        showTurnScreen("Player 2 Turn", () => {
            console.log("Player 2 setup phase begins.");
        });
    });
});
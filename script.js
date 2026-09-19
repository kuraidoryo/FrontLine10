document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.grid-cell');
    
    const instructionText = document.getElementById('instruction-text');
    const currentPieceIcon = document.getElementById('current-piece-icon');
    const piecesCounterDisplay = document.getElementById('pieces-counter');
    const doneButton = document.getElementById('done-button');
    
    let hasFlag = false;
    let pawnsLeft = 10;
    let isSetupPhase = true; 

    function updateSidebarUI() {
        if (!hasFlag) {
            instructionText.textContent = "Place the flag!";
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

            if (this.classList.contains('player-flag-placed')) {
                this.classList.remove('player-flag-placed');
                hasFlag = false;
                updateSidebarUI();
                return;
            }

            if (this.classList.contains('player-placed')) {
                this.classList.remove('player-placed');
                pawnsLeft++;
                updateSidebarUI();
                return;
            }

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
        isSetupPhase = false; 
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

        console.log("Pozycja flagi:", flagPosition);
        console.log("Pozycje pionków:", playerPawnsPositions);
    });
});
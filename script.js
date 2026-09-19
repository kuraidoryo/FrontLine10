document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.grid-cell');
    const piecesCounterDisplay = document.getElementById('pieces-counter');
    const doneButton = document.getElementById('done-button');
    
    let piecesLeft = 10;
    let isSetupPhase = true;

    for (let i = 80; i < 100; i++) {
        const cell = cells[i];
        
        cell.classList.add('placement-zone');

        cell.addEventListener('click', function() {
            if (!isSetupPhase) return;

            if (this.classList.contains('player-placed')) {
                this.classList.remove('player-placed');
                piecesLeft++;
            } 
            else if (piecesLeft > 0) {
                this.classList.add('player-placed');
                piecesLeft--;
            }

            piecesCounterDisplay.textContent = piecesLeft;

            if (piecesLeft === 0) {
                doneButton.disabled = false;
            } else {
                doneButton.disabled = true;
            }
        });
    }

    doneButton.addEventListener('click', () => {
        isSetupPhase = false;
        doneButton.disabled = true;
        doneButton.textContent = "READY";
        doneButton.style.backgroundColor = "#2e7d32";

        let playerPositions = [];

        for (let i = 80; i < 100; i++) {
            cells[i].classList.remove('placement-zone');
            
            if (cells[i].classList.contains('player-placed')) {
                playerPositions.push(i);
            }
        }

        console.log("Zapisane ustawienie pionków gracza na indeksach:", playerPositions);
    });
});
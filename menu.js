document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const localMenu = document.getElementById('local-menu');

    document.getElementById('btn-local').addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        localMenu.classList.remove('hidden');
    });

    document.getElementById('btn-back').addEventListener('click', () => {
        localMenu.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    });

    document.getElementById('btn-1v1').addEventListener('click', () => {
        window.location.href = 'gameFiles/index.html';
    });

    document.getElementById('btn-computer').addEventListener('click', () => {
        window.location.href = 'gameFiles/index.html?mode=ai';
    });
    document.getElementById('btn-online').addEventListener('click', () => {
        const choice = prompt('Type "host" to create a game, or "join" to join:');
        if (choice === 'host') window.location.href = 'gameFiles/index.html?online=host';
        else if (choice === 'join') window.location.href = 'gameFiles/index.html?online=join';
    });
});
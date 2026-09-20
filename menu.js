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
        window.location.href = 'localGame/index.html';
    });

    document.getElementById('btn-computer').addEventListener('click', () => {
        window.location.href = 'localGame/index.html?mode=ai';
    });
});
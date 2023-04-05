const ipcRenderer = require('electron').ipcRenderer

const version = document.getElementById('version');
const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

window.addEventListener('load',function(){
    document.querySelector('body').classList.add("loaded")  
});

$(document).ready(() => {
    window.setTimeout('fadeout();', 500000);

    ipcRenderer.send('app_version');

    ipcRenderer.on('app_version', (event, arg) => {
        ipcRenderer.removeAllListeners('app_version');
        version.innerText = 'Copyright © 2023 | Ver. ' + arg.version;
    });

    ipcRenderer.on('update_available', () => {
        ipcRenderer.removeAllListeners('update_available');
        message.innerText = 'A new update is available. Downloading now...';
        notification.classList.remove('hidden');
    });

    ipcRenderer.on('update_downloaded', () => {
        ipcRenderer.removeAllListeners('update_downloaded');
        message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
        restartButton.classList.remove('hidden');
        notification.classList.remove('hidden');
    });

    ipcRenderer.on('Online:Init', (event, res) => {
        res.forEach((server, i) => {
            $('div.server_status').append(`
                <p>${server[0].players} / ${server[0].maxPlayers}</p>
            `)
        });
    });

    ipcRenderer.on('Online:Answer', (event, res) => {
        res.forEach((server, i) => {
            $(`div.server_status`).find('p').text(`${server[0].players} / ${server[0].maxPlayers}`);
        });
    });

    $('#close').on('click', '', () => {
        ipcRenderer.send('Press:Close');
    });

    $('#resize').on('click', '', () => {
        ipcRenderer.send('Press:Resize');
    });

    $('#start').on('click', '', () => {
        ipcRenderer.send('Press:Play');
    });

    setInterval(() => {
        ipcRenderer.send('Online:Check', []);
    }, 300000);
});

function fadeout(){
    $('#loaded').delay(500000).fadeOut('slow', function() {
       document.querySelector('body').classList.add("loaded")  
    });
}

function closeNotification() {
    notification.classList.add('hidden');
}

function restartApp() {
    ipcRenderer.send('restart_app');
}
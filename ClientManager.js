const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

module.exports = class ClientManager {
    constructor(data) {
        Object.entries(data).forEach(([key, value]) => this[key] = value);

        this.onPressClose = this.onPressClose.bind(this);
        this.onPressResize = this.onPressResize.bind(this);
        this.onPressPlay = this.onPressPlay.bind(this);
    }

    async onPressClose() {
        this.mainWindow.close();
    }

    async onPressResize() {
        this.mainWindow.minimize();
    }    

    async onPressPlay() {
        const gamePath = path.join(__dirname, this.gamePath, 'samp.exe');

        execFile(gamePath, [`-n Maggie_Rhee`, `-h 127.0.0.1`, `-p 7777`], (err, data) => {
            if(err) {
                console.log(`Err`, err);
            }

            console.log(data);
        });

        this.mainWindow.hide();
    }
}
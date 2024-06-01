export default class Music {
    constructor(title, artist, image) {
        this.title = title;
        this.artist = artist;
        //this.duration = duration;
        this.image = image;
        this.isPlaying = false;
    }

    play() {
        this.isPlaying = true;
        console.log(`Now playing: ${this.title} by ${this.artist}`);
    }

    pause() {
        this.isPlaying = false;
        console.log(`Paused: ${this.title}`);
    }

    stop() {
        this.isPlaying = false;
        console.log(`Stopped: ${this.title}`);
    }
}
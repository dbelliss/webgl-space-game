"use strict";

/**
 * Singleton class to control all audio played
 * Sounds are stored in an object pool so that a sound can be overlayed on top of itself
 */
class AudioManager {
    constructor() {
        if (AudioManager.instance !== undefined) {
            console.error("Error: Two instances of AudioManager were created");
            return
        }
        AudioManager.instance = this

        // Locate volume sliders and set callbacks
        const volumeInput = document.getElementById("musicVolumeSlider");
        if (volumeInput == null || volumeInput === undefined) {
            console.error("Error: AudioManager could not locate musicVolumeSlider")
        }
        else {
            volumeInput.addEventListener('mouseup', function() {
                AudioManager.instance.setMusicVolume(this.value/100)
            });
        }
        const sfxInput = document.getElementById("sfxVolumeSlider");
        if (sfxInput == null || sfxInput === undefined) {
            console.error("Error: AudioManager could not locate sfxVolumeSlider")
        }
        else {
            sfxInput.addEventListener('mouseup', function() {
                AudioManager.instance.setSFXVolume(this.value/100)
            });
        }

        this.musicVolume = 1;
        this.sfxVolume = 1;
        this.currentSong = null
        this.music = {} // Mapping from SongEnum to Audio
        this.sounds = {} // Mapping from SoundEnum to array of Audio
        this.loadMusic() // Load music mapping
        this.loadSounds() // Load sounds mapping
    }

    /**
     * Loads the music mappings into the this.music object
     */
    loadMusic() {
        var freeForm = new Audio("./Assets/Audio/freeForm.mp3");
        this.music[SongsEnum.FREEFORM] = freeForm;
    }

    /**
     * Loads the sound mappings into the this.sounds object
     */
    loadSounds() {
        var pickupObjectPool = [];
        for (var i = 0; i < 3; i++) {
            pickupObjectPool.push(new Audio("./Assets/Audio/pickup.ogg"));
        }
        this.sounds[SoundsEnum.PICKUP] = pickupObjectPool;

        var crashSoundPool = []
        for (var i = 0; i < 2; i++) {
            crashSoundPool.push(new Audio("./Assets/Audio/crash.wav"));
        }
        this.sounds[SoundsEnum.CRASH] = crashSoundPool;

        var laserSoundPool = []
        for (var i = 0; i < 2; i++) {
            laserSoundPool.push(new Audio("./Assets/Audio/laser.wav"));
        }
        this.sounds[SoundsEnum.LASER] = laserSoundPool;

        var laserHitSoundPool = []
        for (var i = 0; i < 2; i++) {
            laserHitSoundPool.push(new Audio("./Assets/Audio/empHit.wav"));
        }
        this.sounds[SoundsEnum.LASER_HIT] = laserHitSoundPool;
    }

    /**
     * Plays the given SongEnum
     *
     * @param {songEnum} SongEnum of the song to be played
     */
    playSong(songEnum) {
        if (this.music[songEnum] === undefined) {
            console.err("Could not find song ", songEnum);
            return;
        }

        if (this.currentSong !== null) {
            this.currentSong.stop()
        }

        this.currentSong = this.music[songEnum];
        this._playAudio(this.currentSong, this.musicVolume, true);
    }

    /**
     * Plays the given SoundEnum
     * If a sound does not have a free Audio object in the pool, a new one is generated
     *
     * @param {soundEnum} SoundEnum of the sound to be played
     */
    playSound(soundEnum) {
        var soundInstances = this.sounds[soundEnum];

        if (soundInstances === undefined) {
            console.error("Could not find sound ", soundEnum);
            return;
        }

        for (var i = 0; i < soundInstances.length; i++) {
            var soundInstance = soundInstances[i]
            if (soundInstance.paused) {
                this._playAudio(soundInstance, this.sfxVolume, false)
                return
            }
        }

        // No available instance in pool, create a new one
        var sound = new Audio(soundInstances[0].src)
        soundInstances.push(sound)
        this._playAudio(sound, this.sfxVolume, false)
    }

    /**
     * Sets the music volume
     * Updates currently playing music volume
     *
     * @param {volume} float to set the music volume to, should be in the range [0, 1]
     */
    setMusicVolume(volume) {
        if (volume < 0 || volume > 1) {
            console.error("Volume must be between 0 and 1");
            return;
        }

        console.log("Setting music volume to ", volume)
        this.musicVolume = volume
        if (this.currentSong !== null) {
            this.currentSong.volume = this.musicVolume;
        }
    }

    /**
     * Sets the sfx volume
     * Updates currently playing music volume
     *
     * @param {volume} float to set the sfx volume to, should be in the range [0, 1]
     */
    setSFXVolume(volume) {
        if (volume < 0 || volume > 1) {
            console.err("Volume must be between 0 and 1");
            return;
        }
        console.log("Setting sfx volume to ", volume)
        // Change volume for any currently playing SFX
        var sounds = this.sounds
        Object.keys(sounds).forEach(function(key,index) {
            var soundInstances = sounds[key]
            for (var i = 0; i < soundInstances.length; i++) {
                var soundInstance = soundInstances[i]
                soundInstance.volume = volume
            }
        });

        this.sfxVolume = volume
    }

    /**
     * Plays the given Audio with the given volume
     *
     * @param {audio} Audio object to play
     * @param {volume} float to play the audio at
     * @param {loop} bool true if the audio should loop, false otherwise
     */
    _playAudio(audio, volume, shouldLoop) {
        audio.volume = volume
        audio.loop = shouldLoop
        if (audio.readyState != 4) {
            audio.oncanplaythrough = function() {
                var playPromise = audio.play()
                if (playPromise !== null){
                    playPromise.catch(() => {
                        console.error("Could not playback sound");
                    })
                }
            }
        }
        else {
            var playPromise = audio.play()
                if (playPromise !== null){
                    playPromise.catch(() => {
                        console.error("Could not playback sound");
                    })
                }
        }
    }
}


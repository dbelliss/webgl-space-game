"use strict";

function Initialize() {

    loadJSONResource('./Assets/Models/Asteroid.json', function (modelErr, asteroidObj) {
        loadJSONResource('./Assets/Models/rocket.json', function (modelErr, rocketObj) {
            loadJSONResource('./Assets/Models/laser.json', function (modelErr, laserObj) {
                var game = new Game(asteroidObj, rocketObj, laserObj);
            });
        });
    });
}

class Game {
    initializeMatrices() {
        this.worldMatrix = new Float32Array(16);
        this.viewMatrix = new Float32Array(16);
        this.projMatrix = new Float32Array(16);
    }

    loadHUD() {

        this.canvas2d = document.getElementById('hud');
        this.context2dCtx = this.canvas2d.getContext('2d');;


        this.numCratesCollected = 0
        this.numAsteroidsCollidedWith = 0

        this.updateHUD()
    }

    updateHUD() {
        console.log("Updating HUD");
        var crateImage = new Image();
        crateImage.src = 'Assets/Textures/crate.png';
        var context2dCtx = this.context2dCtx;
        context2dCtx.clearRect(0, 0,  this.canvas2d.width,  this.canvas2d.height);
        crateImage.onload = function() {
            context2dCtx.drawImage(crateImage, 20, 20, 50, 50);
        }

        var asteroidImage = new Image();
        asteroidImage.src = 'Assets/Textures/rocky-texture.jpg';
        asteroidImage.onload = function() {
            context2dCtx.drawImage(asteroidImage, 20, 75, 50, 50);
        }

        context2dCtx.font = "40px Nasalization";
        context2dCtx.fillStyle = "white";
        context2dCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight );
        context2dCtx.textAlign = "left";
        context2dCtx.fillText("x" + this.numCratesCollected, 80, 55);
        context2dCtx.fillText("x" + this.numAsteroidsCollidedWith, 80, 110);

        context2dCtx.textAlign = "right";
        context2dCtx.fillText("Score: " + this.calculateScore(), 950, 55);

        if (this.isPlayerOutOfBounds()) {
            context2dCtx.fillStyle = "red";
            context2dCtx.textAlign = "center";
            context2dCtx.fillText("Warning: Leaving Collection Area", 500, 200);
        }
    }

    calculateScore() {
        var score = 0
        score += this.numCratesCollected * 50
        score -= this.numAsteroidsCollidedWith * 20
        return score
    }

    crateCollected() {
        this.numCratesCollected += 1;
        this.updateHUD();
        this.audioManager.playSound(SoundsEnum.PICKUP);
    }

    constructor(asteroidJson, rocketJson, laserJson) {
        Game.instance = this
        this.laserJson = laserJson;
        this.fieldSize = 500
        this.canvasHeight = 800;
        this.canvasWidth = 800;
        window.onkeydown = function(e) {
            return !(e.keyCode == 32);
        };

        this.initializeAudio();

        // Create WebGL object
        var canvas = document.getElementById('game-surface');
        this.canvas = canvas;
        this.gl = InitializeGL(canvas);
        if (this.gl == undefined) {
            console.error('Could not initialize WebGL');
            return;
        }


        this.loadHUD();

        var gl = this.gl  // Shorter name
        clearGL(gl)

        // Initialize world, view, and proj matrixes
        this.initializeMatrices();

        // Load all textures
        this.textureLoader = new TextureLoader(gl)

        // Load the program that WebGL will use
        this.textureProgram = new TextureProgram(gl, this.worldMatrix, this.viewMatrix, this.projMatrix, this.canvas.clientWidth / this.canvas.clientHeight)
        this.gl.useProgram(this.textureProgram.program);

        // Create list of all active GameObjects to act on during FixedUpdate and Render
        this.activeGameObjects = {}
        this.activeGameObjects["Player"] = []
        this.activeGameObjects["Enemy"] = []
        this.activeGameObjects["Asteroid"] = []
        this.activeGameObjects["Crate"] = []
        this.activeGameObjects["Laser"] = []

        // Create GameObjects
        this.createPlayer(rocketJson);
//        this.createEnemies(0, rocketJson);
        this.createAsteroids(1000, asteroidJson);
        this.createCrates(1000);
        this.camera = new Camera(gl, this.worldMatrix, this.viewMatrix, this.projMatrix);

        this.skybox = new Skybox("Skybox", Vector3.random(0,0), this.textureLoader.getTexture("space"), new Vector3(0,0,0));

        // Render Loop
        var numFrames = 0;
        var theta = 0;
        var phi = 0;
        const asteroids = this.activeGameObjects["Asteroid"]
        const crates = this.activeGameObjects["Crate"]
        const lasers = this.activeGameObjects["Laser"]
        function render () {
            clearGL(this.gl);

            this.camera.trackObject(this.player, theta, phi);

            //
            // Draw all game objects
            //
            this.textureProgram.updateViewMatrix();

            if (asteroids.length > 0) {
                var renderDataList = asteroids[0].renderData; // Render data for all asteroids is the same
                var renderData = renderDataList[0];
                this.textureProgram.batchDraw(asteroids, renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW);
            }

            if (crates.length  > 0) {
                var renderDataList = crates[0].renderData; // Render data for all crates is the same
                var renderData = renderDataList[0];
                this.textureProgram.batchDraw(crates, renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW);
            }

//            if (this.enemies.length > 0) {
//                var renderDataList = this.enemies[0].renderData
//                for (var j = 0; j < renderDataList.length; j++) {
//                    var renderData = renderDataList[j]
//                    this.textureProgram.batchDraw(this.enemies, renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW)
//                }
//            }

            if (lasers.length > 0) {
                var renderDataList = lasers[0].renderData
                for (var j = 0; j < renderDataList.length; j++) {
                    var renderData = renderDataList[j]
                    this.textureProgram.batchDraw(lasers, renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW)
                }
            }

            if (this.player) {
                var gameObject = this.player
                var renderDataList = gameObject.renderData
                for (var j = 0; j < renderDataList.length; j++) {
                    var renderData = renderDataList[j]
                    this.textureProgram.drawMesh(renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW, gameObject.transform)
                }
            }

            if (this.skybox) {
                disableCulling(this.gl);
                var gameObject = this.skybox
                var renderDataList = gameObject.renderData
                for (var j = 0; j < renderDataList.length; j++) {
                    var renderData = renderDataList[j]
                    this.textureProgram.drawMesh(renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW, gameObject.transform)
                }
                enableCulling(this.gl);
            }

            numFrames++;
            requestAnimationFrame(render.bind(this));
        };
        requestAnimationFrame(render.bind(this));
        this.beginFixedUpdateLoop();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isPlayerOutOfBounds() {
        return this.player != undefined && (Math.abs(this.player.transform.position.x) > this.fieldSize / 1.5 ||
                    Math.abs(this.player.transform.position.y) > this.fieldSize / 1.5 ||
                    Math.abs(this.player.transform.position.z) > this.fieldSize / 1.5);
    }

    async beginFixedUpdateLoop() {
        var prevTime = performance.now() / 1000; // Get seconds
        var curTime = performance.now() / 1000;
        var deltaTime = 0
        var updateNum = 0
        this.wasPlayerOutOfBounds = false
        var activeGameObjects = this.activeGameObjects
        while(true) {
            curTime = performance.now() / 1000;
            deltaTime = curTime - prevTime;
            prevTime = curTime;

            this.skybox.transform.position = this.player.transform.position
            if (this.wasPlayerOutOfBounds && !this.isPlayerOutOfBounds()) {
                this.updateHUD()
            }

            if (!this.wasPlayerOutOfBounds && this.isPlayerOutOfBounds()) {
                this.updateHUD()
            }

            this.wasPlayerOutOfBounds = this.isPlayerOutOfBounds()

            Object.keys(activeGameObjects).forEach(function(key,index) {
                for (var i = 0; i < activeGameObjects[key].length; i++) {
                    if (activeGameObjects[key][i].isDestroyed) {
                        activeGameObjects[key].splice(i,1);
                    }
                    else {
                        activeGameObjects[key][i].fixedUpdate(.02)
                    }
                }
            });

            // Check if player has collided with any crates or asteroids
            // TODO: Add proper collision detection that uses spatial hashing
            var spatialHash = this.generateSpatialHash()


            for (var i = 0; i < activeGameObjects["Crate"].length; i++) {
                var crate = activeGameObjects["Crate"][i];
                if (this.player.collider.isCollidingWith(crate.collider)) {
                    crate.onCollisionEnter(this.player);
                }
                for (var j = 0; j < this.activeGameObjects["Laser"].length; j++) {
                    var laser = this.activeGameObjects["Laser"][j];
                    if (laser.collider.isCollidingWith(crate.collider)) {
                        crate.onCollisionEnter(laser);
                        laser.onCollisionEnter(crate);
                    }
                }
            }
            for (var i = 0; i < activeGameObjects["Asteroid"].length; i++) {
                var asteroid = activeGameObjects["Asteroid"][i]
                if (this.player.iFrames <= 0) {
                    if (this.player.collider.isCollidingWith(asteroid.collider)) {
                        Camera.instance.shake(.5);
                        asteroid.onCollisionEnter(this.player);
                        this.player.onCollisionEnter(asteroid)
                    }
                }
                for (var j = 0; j < this.activeGameObjects["Laser"].length; j++) {
                    var laser = this.activeGameObjects["Laser"][j];
                    if (laser.collider.isCollidingWith(asteroid.collider)) {
                        asteroid.onCollisionEnter(laser);
                        laser.onCollisionEnter(asteroid);
                    }
                }
            }

            updateNum++;
            await this.sleep(1000/60); // update every 1/60th of a second
        }
    }

    generateSpatialHash() {
        var cellSize = 5
        for (var i = 0; i < this.activeGameObjects.length; i++) {

        }
    }

    hitByAsteroid() {
        console.log("Hit by asteroid")
        this.player.iFrames = 1
        this.audioManager.playSound(SoundsEnum.CRASH);
        this.numAsteroidsCollidedWith += 1;
        this.updateHUD();
    }

    fireLaser() {
        this.audioManager.playSound(SoundsEnum.LASER);
        var laserSpawnPoint = this.player.transform.position.copy();
        laserSpawnPoint.add(this.player.moveDir.scaled(5)); // Shift laser to the tip of the ship
        var laserRotation = new Float32Array(4)
        this.createLaser(this.laserJson, laserSpawnPoint, glMatrix.quat.copy(laserRotation, this.player.transform.rotation), this.player.moveDir.copy());
        this.player.curCoolDown = this.player.laserCoolDown;
    }

    initializeAudio() {
        var audioManager = new AudioManager();
        this.audioManager = audioManager
        this.audioManager.playSong(SongsEnum.FREEFORM)
        const volumeInput = document.getElementById("musicVolumeSlider");

        volumeInput.addEventListener('mouseup', function() {
            audioManager.setMusicVolume(this.value/100)
        });

        const sfxInput = document.getElementById("sfxVolumeSlider");

        sfxInput.addEventListener('mouseup', function() {
            audioManager.setSFXVolume(this.value/100)
        });
    }

    createAsteroids(numAsteroids, asteroidJson) {
        console.log("Creating asteroids");
        var renderData = []
        var texture = this.textureLoader.getTexture("rock")
        for (var i = 0; i < asteroidJson.meshes.length; i++) {
            var vertices = asteroidJson.meshes[i].vertices
            var indices = [].concat.apply([], asteroidJson.meshes[i].faces)
            var textureVertices = asteroidJson.meshes[i].texturecoords[0]
            renderData.push(new RenderData(texture, vertices, indices, textureVertices))
        }

        for (var i = 0; i < numAsteroids; i++) {
            var asteroid = new Asteroid("asteroid" + i, Vector3.random(-this.fieldSize/2, this.fieldSize/2), renderData)
            this.addGameObject(asteroid);
        }
    }

    createLaser(laserJson, position, rotation, moveDir) {
        console.log("Creating laser");
        var renderData = []
        var texture = this.textureLoader.getTexture("laser")
        for (var i = 0; i < laserJson.meshes.length; i++) {
            var vertices = laserJson.meshes[i].vertices
            var indices = [].concat.apply([], laserJson.meshes[i].faces)
            var textureVertices = laserJson.meshes[i].texturecoords[0]
            renderData.push(new RenderData(texture, vertices, indices, textureVertices))
        }
        var laser = new Laser("Laser", position, renderData, rotation, moveDir);
        this.addGameObject(laser);
    }

    createPlayer(rocketJson) {
        console.log("Creating player");
        var renderData = []
        var texture = this.textureLoader.getTexture("blueRocket")
        for (var i = 0; i < rocketJson.meshes.length; i++) {
            var vertices = rocketJson.meshes[i].vertices
            var indices = [].concat.apply([], rocketJson.meshes[i].faces)
            var textureVertices = rocketJson.meshes[i].texturecoords[0]
            renderData.push(new RenderData(texture, vertices, indices, textureVertices))
        }
        this.player = new Player("Player", new Vector3(0,0,0), renderData);
        this.player.transform.scale.scale(.01)
        this.addGameObject(this.player);
    }

    createEnemies(numEnemies, rocketJson) {
        var renderData = []
        var texture = this.textureLoader.getTexture("redRocket")
        for (var i = 0; i < rocketJson.meshes.length; i++) {
            var vertices = rocketJson.meshes[i].vertices
            var indices = [].concat.apply([], rocketJson.meshes[i].faces)
            var textureVertices = rocketJson.meshes[i].texturecoords[0]
            renderData.push(new RenderData(texture, vertices, indices, textureVertices))
        }
        for (var i = 0; i < numEnemies; i++) {
            var enemy = new Rocket("Enemy " + i, new Vector3(0,i,0), renderData, this.player)
            enemy.transform.scale.scale(.01);
            this.addGameObject(enemy, enemy.tag);
        }
    }

    createCrates(numCrates) {
        console.log("Creating crates");
        for (var i = 0; i < numCrates; i++) {
            var deltaRotation = Vector3.random(0, 1); // Rotation speed for the crate
            var crate = new Crate("crate" + i, Vector3.random(-this.fieldSize/2, this.fieldSize/2), this.textureLoader.getTexture("crate"), deltaRotation);
            this.addGameObject(crate);
        }
    }

    addGameObject(gameObject) {
        this.activeGameObjects[gameObject.tag].push(gameObject);
    }
}

"use strict";

function Initialize() {

    loadJSONResource('./Assets/Asteroid.json', function (modelErr, asteroidObj) {
        loadJSONResource('./Assets/rocket.json', function (modelErr, rocketObj) {
            loadJSONResource('./Assets/laser.json', function (modelErr, laserObj) {
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
        crateImage.src = 'Assets/crate.png';
        var context2dCtx = this.context2dCtx;
        context2dCtx.clearRect(0, 0,  this.canvas2d.width,  this.canvas2d.height);
        crateImage.onload = function() {
            context2dCtx.drawImage(crateImage, 20, 20, 50, 50);
        }

        var asteroidImage = new Image();
        asteroidImage.src = 'Assets/rocky-texture.jpg';
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

    constructor(asteroidJson, rocketJson, laserJson) {
        this.laserJson = laserJson;
        this.fieldSize = 300
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

        // Load renderer
        this.renderer = new Renderer(this.gl, this.textureLoader, this.textureProgram);

        this.gl.useProgram(this.textureProgram.program);

        // Create list of all active GameObjects to act on during FixedUpdate
        this.activeGameObjects = []

        // Create GameObjects
        this.crates = []
        this.asteroids = []
        this.enemies = []
        this.lasers = []
        this.createPlayer(rocketJson);
        this.createEnemies(0, rocketJson)
        this.createAsteroids(1000, asteroidJson)
        this.createCrates(1000)
        this.createWalls()
        this.camera = new Camera(gl, this.worldMatrix, this.viewMatrix, this.projMatrix);

        // Render Loop
        var numFrames = 0
        var theta = 0
        var phi = 0
        function render () {
            clearGL(this.gl)
            var cameraInput = InputManager.readCameraInput()

            theta = cameraInput.x;
            phi = cameraInput.y;
            this.camera.trackObject(this.player, theta, phi);
            this.textureProgram.updateCamera()

            if (this.asteroids.length > 0) {
                var renderDataList = this.asteroids[0].renderData
                var renderData = renderDataList[0]
                this.textureProgram.batchDraw(this.asteroids, renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW)
            }

            if (this.crates.length > 0) {
                var renderDataList = this.crates[0].renderData
                var renderData = renderDataList[0]
                this.textureProgram.batchDraw(this.crates, renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW)
            }

            if (this.enemies.length > 0) {
                var renderDataList = this.enemies[0].renderData
                for (var j = 0; j < renderDataList.length; j++) {
                    var renderData = renderDataList[j]
                    this.textureProgram.batchDraw(this.enemies, renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW)
                }
            }


            if (this.lasers.length > 0) {
                var renderDataList = this.lasers[0].renderData
                for (var j = 0; j < renderDataList.length; j++) {
                    var renderData = renderDataList[j]
                    this.textureProgram.batchDraw(this.lasers, renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW)
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
        while(true) {
            curTime = performance.now() / 1000;
            deltaTime = curTime - prevTime;
            prevTime = curTime;
            if (this.wasPlayerOutOfBounds && !this.isPlayerOutOfBounds()) {
                this.updateHUD()
            }

            if (!this.wasPlayerOutOfBounds && this.isPlayerOutOfBounds()) {
                this.updateHUD()
            }

            this.wasPlayerOutOfBounds = this.isPlayerOutOfBounds()

            this.activeGameObjects.forEach(function (gameObject) {
                gameObject.fixedUpdate(.02)
            })

            if (InputManager.isKeyPressed("F") && this.player.curCoolDown < 0) {
                this.audioManager.playSound(SoundsEnum.LASER);
                var laserSpawnPoint = this.player.transform.position.copy();
                laserSpawnPoint.add(this.player.moveDir.scaled(5));
                this.createLaser(this.laserJson, laserSpawnPoint, this.player.transform.rotation.copy(), this.player.moveDir.copy());
                this.player.curCoolDown = this.player.laserCoolDown;
            }

            for (var i = 0; i < this.lasers.length; i++) {
                var laser = this.lasers[i]
                if (laser.despawnTime <= 0) {
                    this.lasers.splice(i,1);
                    //TODO: Remove from gameobject list
                }
            }

            for (var i = 0; i < this.crates.length; i++) {
                var crate = this.crates[i];
                if (crate.transform.position.distance(this.player.transform.position) < 3) {
                    console.log("Crate!")
                    this.numCratesCollected += 1;
                    this.updateHUD();
                    this.audioManager.playSound(SoundsEnum.PICKUP);
                    this.crates.splice(i,1);
                    //TODO: Remove from gameobject list
                }
                if (i < this.crates.length/3) {
                    crate.transform.rotation.x = (crate.transform.rotation.x + 1) % 360
                }
                else if (i < this.crates.length * 2/3) {
                    crate.transform.rotation.y = (crate.transform.rotation.y + 1) % 360
                }
                else{
                    crate.transform.rotation.z = (crate.transform.rotation.z + 1) % 360
                }
            }
            for (var i = 0; i < this.asteroids.length; i++) {
                var asteroid = this.asteroids[i]
                if (asteroid.transform.position.distance(this.player.transform.position) < 1 && this.player.iFrames <= 0) {
                    this.player.iFrames = 1
                    this.audioManager.playSound(SoundsEnum.CRASH);
                    this.numAsteroidsCollidedWith += 1;
                    this.updateHUD();
                    console.log("Hit by asteroid")
                }
                if (i < this.asteroids.length/3) {
                    asteroid.transform.rotation.x = (this.asteroids[i].transform.rotation.x + this.asteroids[i].rotationSpeed) % 360
                }
                else if (i < this.asteroids.length * 2/3) {
                    asteroid.transform.rotation.y = (this.asteroids[i].transform.rotation.y + this.asteroids[i].rotationSpeed) % 360
                }
                else{
                    asteroid.transform.rotation.z = (this.asteroids[i].transform.rotation.z + this.asteroids[i].rotationSpeed) % 360
                }
            }

            updateNum++;
            await this.sleep(1000/60);
        }
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
        var scales = [new Vector3(.04, .05, .04)]
        for (var i = 2; i < 10; i++) {
            scales.push(scales[0].scaled(i));
        }
        var renderData = []
        var texture = this.textureLoader.getTexture("rock")
        for (var i = 0; i < asteroidJson.meshes.length; i++) {
            var vertices = asteroidJson.meshes[i].vertices
            var indices = [].concat.apply([], asteroidJson.meshes[i].faces)
            var textureVertices = asteroidJson.meshes[i].texturecoords[0]
            renderData.push(new RenderData(texture, vertices, indices, textureVertices))
        }

        for (var i = 0; i < numAsteroids; i++) {
            var asteroid = new MeshObject("asteroid" + i, Vector3.random(-this.fieldSize/2, this.fieldSize/2), renderData)
            asteroid.transform.scale = scales[Math.floor(scales.length * Math.random())]
            asteroid.transform.rotation.x = Math.random() * 360
            asteroid.transform.rotation.y = Math.random() * 360
            asteroid.transform.rotation.z = Math.random() * 360
            asteroid.rotationSpeed = Math.random() * 2
            this.asteroids.push(asteroid);
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
        var laser = new Laser("Laser", position, renderData, moveDir);

        laser.transform.rotation = rotation
        laser.transform.scale.scale(.3)
        laser.transform.scale.y *= 3
        this.lasers.push(laser)
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
            this.enemies.push(enemy);
            this.addGameObject(enemy);
        }
    }

    createCrates(numCrates) {
        console.log("Creating crates");
        for (var i = 0; i < numCrates; i++) {
            var crate = new Cube("crate" + i, Vector3.random(-this.fieldSize/2, this.fieldSize/2), this.textureLoader.getTexture("crate"))
            crate.transform.rotation.x = Math.random() * 360
            crate.transform.rotation.y = Math.random() * 360
            crate.transform.rotation.z = Math.random() * 360
            this.crates.push(crate);
            this.addGameObject(crate);
        }
    }

    addGameObject(gameObject) {
        this.activeGameObjects.push(gameObject);
//        this.renderer.addObject(gameObject)
    }

    createWalls() {
        console.log("Walls have not yet been implemented");
    }
}

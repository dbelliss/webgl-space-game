"use strict";

var loaded = false;
var asteroidJson = null
var rocketJson = null
var laserJson = null
var elem = document.getElementById("myBar");
var loadProgress = 0
var game = null
var startButton = document.getElementById("startButton");
var startMenu = document.getElementById("startMenu");

function StartGame() {
    console.log("Starting game");
    if (loaded) {
        startButton.disabled = true;
        startMenu.style.visibility = "hidden";
        startButton.style.visibility = "hidden";
        game.startGame();
    }
    else {
        console.log("But assets have not loaded yet");
    }
}

function updateLoadProgress() {
    loadProgress += 10;
    elem.style.width = loadProgress + '%';
    if (loadProgress >= 100) {
        startButton.disabled = false;
        startButton.style.visibility = "visible";
    }
}

function Initialize() {
    loadJSONResource('./Assets/Models/Asteroid.json', function (modelErr, asteroidObj) {
        asteroidJson = asteroidObj;
        updateLoadProgress();
        loadJSONResource('./Assets/Models/rocket.json', function (modelErr, rocketObj) {
            rocketJson = rocketObj;
            updateLoadProgress();
            loadJSONResource('./Assets/Models/laser.json', function (modelErr, laserObj) {
                laserJson = laserObj;
                updateLoadProgress();
                game = new Game(asteroidJson, rocketJson, laserJson);
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

    constructor(asteroidJson, rocketJson, laserJson) {
        Game.instance = this

        this.laserJson = laserJson;
        this.fieldSize = 500

        // Prevent spacebar from scrolling down the page
        window.onkeydown = function(e) {
            return !(e.keyCode == 32);
        };

        // Create WebGL object
        var canvas = document.getElementById('game-surface');
        this.canvas = canvas;

        // Get clientHeight/Width set by the CSS
        this.canvasHeight = canvas.clientHeight;
        this.canvasWidth = canvas.clientWidth;

        this.gl = InitializeGL(canvas);
        if (this.gl == undefined) {
            console.error('Could not initialize WebGL');
            return;
        }
        updateLoadProgress();
        var gl = this.gl  // Shorter name
        clearGL(gl);

        // Initialize world, view, and proj matrixes
        this.initializeMatrices();

        // Create list of all active GameObjects to act on during FixedUpdate and Render
        // Keep similar objects in the same bucket to optimize render calls
        this.activeGameObjects = {}
        this.activeGameObjects["Player"] = []
        this.activeGameObjects["Enemy"] = []
        this.activeGameObjects["Asteroid"] = []
        this.activeGameObjects["Crate"] = []
        this.activeGameObjects["Laser"] = []

        // Load all textures
        this.textureLoader = new TextureLoader(gl)
        updateLoadProgress();

        // Load the program that WebGL will use
        this.textureProgram = new TextureProgram(gl, this.worldMatrix, this.viewMatrix, this.projMatrix, this.canvas.clientWidth / this.canvas.clientHeight)
        this.gl.useProgram(this.textureProgram.program);

        // Create GameObjects
        this.createPlayer(rocketJson);
        updateLoadProgress();
        this.createEnemies(50, rocketJson);
        updateLoadProgress();
        this.createAsteroids(500, asteroidJson);
        updateLoadProgress();
        this.createCrates(1000);

        // Initialize Game Managers
        this.touchControlManager = new TouchControlManager();
        this.ui = new UI(document.getElementById('hud'));
        this.collisionManager = new CollisionManager(this.activeGameObjects)
        this.audioManager = new AudioManager();

        updateLoadProgress();

        this.camera = new Camera(gl, this.worldMatrix, this.viewMatrix, this.projMatrix);
        this.skybox = new Skybox("Skybox", Vector3.random(0,0), this.textureLoader.getTexture("space"), new Vector3(0,0,0));
        updateLoadProgress();
        loaded = true;
    }

    startGame() {
        this.audioManager.playSong(SongsEnum.FREEFORM)
        requestAnimationFrame(this.render.bind(this));
        this.beginFixedUpdateLoop(this);
    }

    render () {
        // Render Loop
        var numFrames = 0;
        var theta = 0;
        var phi = 0;
        var gl = this.gl;
        const asteroids = this.activeGameObjects["Asteroid"]
        const crates = this.activeGameObjects["Crate"]
        const lasers = this.activeGameObjects["Laser"]
        const enemies = this.activeGameObjects["Enemy"]
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

        if (enemies.length > 0) {
            var renderDataList = enemies[0].renderData
            for (var j = 0; j < renderDataList.length; j++) {
                var renderData = renderDataList[j]
                this.textureProgram.batchDraw(enemies, renderData.vertices, renderData.indices, renderData.textureIndices, renderData.texture, gl.DYNAMIC_DRAW)
            }
        }

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
        requestAnimationFrame(this.render.bind(this));
    };

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isPlayerOutOfBounds() {
        return this.player != undefined && (Math.abs(this.player.transform.position.x) > this.fieldSize / 1.5 ||
                    Math.abs(this.player.transform.position.y) > this.fieldSize / 1.5 ||
                    Math.abs(this.player.transform.position.z) > this.fieldSize / 1.5);
    }

    async beginFixedUpdateLoop(game) {
        var prevTime = performance.now() / 1000; // Get seconds
        var curTime = performance.now() / 1000;
        var deltaTime = 0
        var updateNum = 0
        this.wasPlayerOutOfBounds = false
        var activeGameObjects = game.activeGameObjects
        var fieldSize = game.fieldSize;
        while(true) {
            curTime = performance.now() / 1000;
            deltaTime = curTime - prevTime;
            prevTime = curTime;

            game.skybox.transform.position = game.player.transform.position
            if (game.wasPlayerOutOfBounds && !game.isPlayerOutOfBounds()) {
                game.ui.updateHUD()
            }

            if (!game.wasPlayerOutOfBounds && game.isPlayerOutOfBounds()) {
                game.ui.updateHUD()
            }

            game.wasPlayerOutOfBounds = game.isPlayerOutOfBounds()

            Object.keys(activeGameObjects).forEach(function(key,index) {
                for (var i = 0; i < activeGameObjects[key].length; i++) {
                    var gameObject = activeGameObjects[key][i];
                    if (gameObject.tag != "Player" && gameObject.tag != "Skybox" && (Math.abs(gameObject.transform.position.x) > fieldSize ||
                            Math.abs(gameObject.transform.position.y) > fieldSize ||
                            Math.abs(gameObject.transform.position.z) > fieldSize)) {
                        console.log("Destroying ", gameObject);
                        gameObject.isDestroyed = true;
                    }
                    if (gameObject.isDestroyed) {
                        // call Object destructor and remove from object list
                        gameObject.destroy()
                        activeGameObjects[key].splice(i,1);
                    }
                    else {
                        if (gameObject.isActive) {
                            gameObject.fixedUpdate(.02)
                        }
                    }
                }
            });

            // Check for collisions
            var spatialHash = game.collisionManager.spatialHash
            Object.keys(spatialHash).forEach(function(key,index) {
                var xHash = spatialHash[key]
                Object.keys(xHash).forEach(function(key,index) {
                    var yHash = xHash[key]
                    Object.keys(yHash).forEach(function(key,index) {
                        var zHash = yHash[key]
                        var gameObjects = zHash
                        for (var i = 0; i < gameObjects.length; i++) {
                            for (var j = i + 1; j < gameObjects.length; j++) {
                                var gameObject1 = gameObjects[i]
                                var gameObject2 = gameObjects[j]
                                if (gameObject1.collider.isCollidingWith(gameObject2.collider)) {
                                    gameObject1.onCollisionEnter(gameObject2);
                                    gameObject2.onCollisionEnter(gameObject1);
                                }
                            }
                        }
                    })
                })
            })

            updateNum++;
            await this.sleep(1000/60); // update every 1/60th of a second
        }
    }

    crateCollected() {
        this.ui.numCratesCollected += 1;
        this.ui.updateHUD();
        this.audioManager.playSound(SoundsEnum.PICKUP);
    }

    hitByAsteroid() {
        console.log("Hit by asteroid")
        this.player.iFrames = 1
        this.audioManager.playSound(SoundsEnum.CRASH);
        this.ui.numAsteroidsCollidedWith += 1;
        this.ui.updateHUD();
    }

    hitRocket() {
        console.log("Hit a rocket")
        this.ui.numRocketsHit += 1;
        this.ui.updateHUD();
    }

    fireLaser() {
        this.audioManager.playSound(SoundsEnum.LASER);
        var laserSpawnPoint = this.player.transform.position.copy();
        laserSpawnPoint.add(this.player.moveDir.scaled(5)); // Shift laser to the tip of the ship
        var laserRotation = new Float32Array(4)
        this.createLaser(this.laserJson, laserSpawnPoint, glMatrix.quat.copy(laserRotation, this.player.transform.rotation), this.player.moveDir.copy());
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
        console.log("Creating enemies");
        var renderData = []
        var texture = this.textureLoader.getTexture("redRocket")
        for (var i = 0; i < rocketJson.meshes.length; i++) {
            var vertices = rocketJson.meshes[i].vertices
            var indices = [].concat.apply([], rocketJson.meshes[i].faces)
            var textureVertices = rocketJson.meshes[i].texturecoords[0]
            renderData.push(new RenderData(texture, vertices, indices, textureVertices))
        }
        for (var i = 0; i < numEnemies; i++) {
            var enemy = new SimpleEnemyRocket("Enemy " + i, Vector3.random(-this.fieldSize/2, this.fieldSize/2), renderData, this.player)
            enemy.transform.scale.scale(.01);
            enemy.tag = "Enemy";
            this.addGameObject(enemy, enemy.tag);
        }
    }

    createCrates(numCrates) {
        console.log("Creating crates");
        var origin = new Vector3(0,0,0)
        for (var i = 0; i < numCrates; i++) {
            var deltaRotation = Vector3.random(0, 1); // Rotation speed for the crate
            var asteroidPos = Vector3.random(-this.fieldSize/2, this.fieldSize/2)
            while (asteroidPos.distance(origin) < 10) {
                asteroidPos = Vector3.random(-this.fieldSize/2, this.fieldSize/2)
            }
            var crate = new Crate("crate" + i, asteroidPos, this.textureLoader.getTexture("crate"), deltaRotation);
            this.addGameObject(crate);
        }
    }

    addGameObject(gameObject) {
        this.activeGameObjects[gameObject.tag].push(gameObject);
    }
}

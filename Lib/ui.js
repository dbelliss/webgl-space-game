class UI {
    constructor(canvas2d) {
        if (UI.instance !== undefined) {
            console.error("Error: Two instances of UI were created");
            return;
        }
        UI.instance = this;

        this.loadHUD(canvas2d);
    }

    loadHUD(canvas2d) {
        if (canvas2d === undefined || canvas2d == null) {
            console.error("UI was not given a valid canvas");
            return;
        }

        this.canvas2d = canvas2d
        this.context2dCtx = this.canvas2d.getContext('2d');;

        this.numCratesCollected = 0
        this.numAsteroidsCollidedWith = 0
        this.numRocketsHit = 0

        this.crateIcon = new UIImage(this.context2dCtx, 'Assets/Textures/crate.png', 20, 20, 50, 50)
        this.asteroidIcon = new UIImage(this.context2dCtx, 'Assets/Textures/asteroidIcon.png', 20, 130, 50, 50)
        this.rocketIcon = new UIImage(this.context2dCtx, 'Assets/Textures/rocketIcon.png', 20, 75, 50, 50)

        var canvasHeight = Game.instance.canvasHeight;
        var canvasWidth = Game.instance.canvasWidth;
        this.goButton = new UIButton(this.context2dCtx, 'Assets/Textures/RocketGo.png', canvasWidth - 150, canvasHeight - 150, 100, 100, TouchControlManager.instance.goFunction, TouchControlManager.instance.goReleaseFunction, false)
        this.laserButton = new UIButton(this.context2dCtx, 'Assets/Textures/laserBeamIcon.png', canvasWidth - 150, canvasHeight - 300, 100, 100, TouchControlManager.instance.laserFunction, undefined, false)
        this.buttons = [this.goButton, this.laserButton]

        this.updateHUD()
    }

    enableTouchButtons() {
        this.goButton.enabled = true;
        this.laserButton.enabled = true;
        this.updateHUD();
    }

    disableTouchButtons() {
        this.goButton.enabled = false;
        this.laserButton.enabled = false;
        this.updateHUD();
    }

    updateHUD() {
        console.log("Updating HUD");
        var canvasHeight = Game.instance.canvasHeight;
        var canvasWidth = Game.instance.canvasWidth;

        var context2dCtx = this.context2dCtx;
        context2dCtx.clearRect(0, 0,  this.canvas2d.width,  this.canvas2d.height);

        this.crateIcon.draw();
        this.asteroidIcon.draw();
        this.goButton.draw();
        this.rocketIcon.draw();
        this.laserButton.draw();

        context2dCtx.font = "40px Nasalization";

        context2dCtx.textAlign = "left";
        context2dCtx.fillStyle = "white";
        context2dCtx.fillText("x" + this.numCratesCollected, 80, 55);
        context2dCtx.fillText("x" + this.numRocketsHit, 80, 110);
        context2dCtx.fillStyle = "red";
        context2dCtx.fillText("x" + this.numAsteroidsCollidedWith, 80, 165);


        context2dCtx.fillStyle = "white";
        context2dCtx.textAlign = "center";
        context2dCtx.fillText(Game.instance.timeLeft, canvasWidth/2, 55);

        if (Game.instance.isPlayerOutOfBounds()) {
            context2dCtx.fillStyle = "red";
            context2dCtx.fillText("Warning: Leaving Collection Area", canvasWidth/2, canvasHeight/5);
        }

        context2dCtx.fillStyle = "white";
        context2dCtx.textAlign = "right";
        context2dCtx.fillText("Score: " + this.calculateScore(), canvasWidth - 100, 55);

    }

    calculateScore() {
        var score = 0;
        score += this.numCratesCollected * 50;
        score += this.numRocketsHit * 300;
        score -= this.numAsteroidsCollidedWith * 20;
        return score;
    }
}
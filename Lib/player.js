"use strict";

/**
 * Class for the Player
 * Takes in input to move the player around the map
 */
class Player extends Rocket {
    constructor(_name, position, renderData) {
        super(_name, position, renderData);
        this.tag = "Player"
        this.thrust = 1
        this.maxSpeed = 50
        this.turnPower = -1
    }

    /**
     * Physics update the GameObject
     *
     * First read in input to apply forces, then call the parent fixedUpdate()
     * @param {deltaTime} float for the amount of seconds that have passed since the last fixedUpdate
     */
    fixedUpdate(deltaTime) {
        this.curCoolDown -= deltaTime



        super.fixedUpdate(deltaTime)

        // Handle laser firing
        if (InputManager.shouldFireLaser() && this.curCoolDown < 0) {
            Game.instance.fireLaser()
            this.curCoolDown = this.laserCoolDown;
        }
    }

    getInput() {
        if (TouchControlManager.instance.touchControlsEnabled) {
            return InputManager.readTouchInput().scaled(this.turnPower)
        }
        else {
            return InputManager.readKeyboardInput().scaled(this.turnPower)
        }
    }

    onCollisionEnter(other) {
        if (other.tag == "Asteroid") {
            if (this.iFrames >= 0) {
                return
            }
            Game.instance.hitByAsteroid()
            Camera.instance.shake(.5);
            this.velocity.scale(0);
            var forceDir = this.transform.position.difference(other.transform.position)
            forceDir.scale(2)
            this.addForce(forceDir)
        }
    }

    shouldMove() {
        return InputManager.shouldMove();;
    }
}
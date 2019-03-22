"use strict";

/**
 * Class for the Player
 * Takes in input to move the player around the map
 */
class SimpleEnemyRocket extends EnemyRocket {
    constructor(_name, position, renderData) {
        super(_name, position, renderData);
        this.thrust = 1
        this.maxSpeed = 10
        this.movementPatten = Vector3.random(-1, 1);
    }

    /**
     * Physics update the GameObject
     *
     * First read in input to apply forces, then call the parent fixedUpdate()
     * @param {deltaTime} float for the amount of seconds that have passed since the last fixedUpdate
     */
    fixedUpdate(deltaTime) {
        super.fixedUpdate(deltaTime)
    }

    getInput() {
        return this.movementPatten;
    }

    onCollisionEnter(other) {
        if (other.tag == "Asteroid" || other.tag == "Player") {
            this.isStunned = true;
            var forceDir = this.transform.position.difference(other.transform.position)
            forceDir.scale(other.mass)
            this.addForce(forceDir)
        }
        if (other.tag == "Crate") {
            other.isDestroyed = true;
        }
        if (other.tag == "Laser") {
            Game.instance.audioManager.playSound(SoundsEnum.POWER_DOWN);
            if (!this.isStunned) {
                Game.instance.hitRocket(); // Add to score
            }
            this.isStunned = true;
            var forceDir = this.transform.position.difference(other.transform.position)
            forceDir.scale(5)
            this.addForce(forceDir)
        }

    }
}
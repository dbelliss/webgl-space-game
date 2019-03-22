"use strict";

/**
 * Class for the Player
 * Takes in input to move the player around the map
 */
class EnemyRocket extends Rocket {
    constructor(_name, position, renderData) {
        super(_name, position, renderData);
        this.tag = "Enemy";
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

    }

    shouldMove() {
        return !this.isStunned;
    }
}
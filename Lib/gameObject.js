"use strict";

/**
 * Base class for all objects in the game
 * Each GameObject must have a name, position, and texture
 */
class GameObject {
    constructor(_name, position) {
        this.tag = "GameObject"
        this.name = _name;
        this.transform = new Transform(position);
        this.mass = 1
        this.velocity = new Vector3(0, 0, 0)
        this.drag = .001;
        this.maxSpeed = 50
        this.isDestroyed = false; // If this is true, object will be destroyed on next fixedUpdate
        this.epsilon = .01
        this.spatialHashBuckets = []
    }

    /**
     * Apply a force to the GameObject
     * @param {force} a Vector3 of the force being applied
     */
    addForce(force) {
        this.velocity.add(force.scaled(1/this.mass))
    }

    /**
     * Physics update the GameObject
     * @param {deltaTime} float for the amount of seconds that have passed since the last fixedUpdate
     */
    fixedUpdate(deltaTime) {
        var speed = this.velocity.magnitude()

        if (speed > this.maxSpeed) {
            var factor = speed / this.maxSpeed
            this.velocity.scale(1/factor)
        }
        if (!(this.velocity.x == 0 && this.velocity.y == 0 && this.velocity.z == 0)) {
            this.transform.position.add(this.velocity.scaled(deltaTime));
            this.applyDrag();
            this.updateSpatialHash();
        }
    }

    removeFromSpatialHash() {
        for (var i = 0; i < this.spatialHashBuckets.length; i++) {
            var array = this.spatialHashBuckets[i]
            for(var j = 0; j < array.length; j++){
                if (array[j] === this) {
                    array.splice(j, 1);
                }
            }
            if (this.spatialHashBuckets[i].length == 0) {
                this.spatialHashBuckets.splice(i, 1);
                i -= 1;
            }
        }
    }

    destroy() {
        this.removeFromSpatialHash();
    }

    updateSpatialHash() {
        this.removeFromSpatialHash()
        CollisionManager.instance.addToSpatialHash(this)
    }

    /**
     * Apply air resistance to the GameObject
     * Should be called every FixedUpdate
     */
    applyDrag() {
        if (Math.abs(this.velocity.x) < this.drag) {
                this.velocity.x = 0
        }
        else {
            if (this.velocity.x > 0) {
                this.velocity.x -= this.drag;
            }
            else {
                this.velocity.x += this.drag;
            }
        }

        if (Math.abs(this.velocity.y) < this.drag) {
            this.velocity.y = 0
        }
        else {
            if (this.velocity.y > 0) {
                this.velocity.y -= this.drag;
            }
            else {
                this.velocity.y += this.drag;
            }
        }

        if (Math.abs(this.velocity.z) < this.drag) {
            this.velocity.z = 0
        }
        else {
            if (this.velocity.z > 0) {
                this.velocity.z -= this.drag;
            }
            else {
                this.velocity.z += this.drag;
            }
        }
    }

    debugInfo() {
        return `Name:${this.name}, Position:${this.transform.debugInfo()}`
    }
}

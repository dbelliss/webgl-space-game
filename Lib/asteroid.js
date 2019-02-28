"use strict";

/**
 * Class for a Asteroid GameObject
 */
class Asteroid extends MeshObject{
    constructor(_name, position, renderData) {
        super(_name, position);
        this.tag = "Asteroid"
        this.transform.position = position;
        this.renderData = renderData

        var rotationType = Math.random()
        if (rotationType < .3) {
            this.deltaRotation = new Vector3(1, 0, 0)
        }
        else if (rotationType < .6) {
            this.deltaRotation = new Vector3(0, 1, 0)
        }
        else{
            this.deltaRotation = new Vector3(0, 0, 1)
        }

        this.transform.scale = new Vector3(.04, .05, .04)
        this.transform.scale.scale(1 + Math.floor(Math.random() * 8))

        // Set random initial rotation
        this.transform.rotation.x = Math.random() * 360;
        this.transform.rotation.y = Math.random() * 360;
        this.transform.rotation.z = Math.random() * 360;
    }

    onCollisionEnter(other) {
        if (other.tag == "Player") {
            Game.instance.hitByAsteroid()
        }
    }

    fixedUpdate(deltaTime) {
        // Rotate by the set amount
        this.transform.rotation.x = (this.transform.rotation.x + this.deltaRotation.x) % 360;
        this.transform.rotation.y = (this.transform.rotation.y + this.deltaRotation.y) % 360;
        this.transform.rotation.z = (this.transform.rotation.z + this.deltaRotation.z) % 360;
        super.fixedUpdate(deltaTime)
    }
}

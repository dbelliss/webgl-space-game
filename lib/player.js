"use strict";

/**
 * Class for the Player
 * Takes in input to move the player around the map
 */
class Player extends MeshObject {
    constructor(_name, position, renderData) {
        super(_name, position, renderData);
        this.transform.rotation.x = 90
        this.moveDir = new Vector3(0,0,1)
        this.thrust = 1
        this.turnPower = -1.2
        this.theta = 0
        this.phi = 0
        this.baseRotation = new Vector3(this.transform.rotation.x, this.transform.rotation.y, this.transform.rotation.z)
        this.iFrames = 0; // Invincibility frames
        this.laserCoolDown = 1
        this.curCoolDown = 0

    }

    /**
     * Physics update the GameObject
     *
     * First read in input to apply forces, then call the parent fixedUpdate()
     * @param {deltaTime} float for the amount of seconds that have passed since the last fixedUpdate
     */
    fixedUpdate(deltaTime) {
        this.iFrames -= deltaTime
        this.curCoolDown -= deltaTime
        var input = InputManager.readInput().scaled(this.turnPower)
        this.transform.rotation.y = (this.transform.rotation.y + input.x) % 360
        this.transform.rotation.x = (this.transform.rotation.x + input.y)
        if (this.transform.rotation.x > 179) {
            this.transform.rotation.x = -179
        }
        else if (this.transform.rotation.x < -179) {
            this.transform.rotation.x = 179
        }
        var quat = new Float32Array(4)
        glMatrix.quat.fromEuler(quat, [this.transform.rotation.x, this.transform.rotation.y, 0])
        var mat = new Float32Array(16)
        glMatrix.mat4.identity(mat)
        var out = new Float32Array(16)

        var vec = [0,0,0];
        glMatrix.vec3.rotateX(vec, [0,0,1], [0,0,0], (this.transform.rotation.x - 90)/ 180 * Math.PI)
        glMatrix.vec3.rotateY(vec, vec, [0,0,0], this.transform.rotation.y / 180 * Math.PI)
        this.moveDir = new Vector3(vec[0], vec[1], vec[2])

        var x = Math.sin(this.transform.rotation.x/180 * Math.PI) * Math.cos(this.transform.rotation.y/180 * Math.PI)
        var y = Math.sin(this.transform.rotation.x/180 * Math.PI) * Math.sin(this.transform.rotation.y/180 * Math.PI)
        var z = Math.cos(this.transform.rotation.x/180 * Math.PI)

        var magnitude = this.velocity.magnitude()
        this.velocity = this.moveDir.scaled(magnitude)

        var shouldMove = InputManager.isKeyPressed("space");
        if (shouldMove) {
            this.drag = 0
            this.addForce(this.moveDir.scaled(this.thrust));
        }
        else {
            this.drag = 1000
        }
        super.fixedUpdate(deltaTime)
    }
}
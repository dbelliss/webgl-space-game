"use strict";

/**
 * Class for the Player
 * Takes in input to move the player around the map
 */
class Player extends MeshObject {
    constructor(_name, position, renderData) {
        super(_name, position, renderData);
        this.tag = "Player"

        glMatrix.quat.fromEuler(this.transform.rotation, 0, 0, 0)
        this.originalRotation = new Float32Array(4);
        glMatrix.quat.copy(this.originalRotation, this.transform.rotation)
        this.deltaX = 0;
        this.deltaZ = 0;
        this.moveDir = new Vector3(0,1,0)
        this.thrust = 1
        this.turnPower = -1.2
        this.theta = 0
        this.phi = 0
        this.iFrames = 0; // Invincibility frames
        this.laserCoolDown = 1
        this.curCoolDown = 0
        this.collider = new BoxCollider(this.transform.position, 2, 2, 2)
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
        this.deltaX += input.x
        this.deltaZ += input.y


        var deltaZRotation = new Float32Array(4)
        glMatrix.quat.fromEuler(deltaZRotation, 0, 0, this.deltaZ);
        glMatrix.quat.mul(this.transform.rotation, deltaZRotation, this.originalRotation)

        var deltaXRotation = new Float32Array(4)
        glMatrix.quat.fromEuler(deltaXRotation, this.deltaX, 0, 0);
        glMatrix.quat.mul(this.transform.rotation,  deltaXRotation, this.transform.rotation)



        var newMoveDir = new Float32Array(3);
        newMoveDir[1] = 1

        glMatrix.vec3.transformQuat(newMoveDir, newMoveDir, this.transform.rotation)

        this.moveDir.x = newMoveDir[0]
        this.moveDir.y = newMoveDir[1]
        this.moveDir.z = newMoveDir[2]

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

        // Handle laser firing
        if (InputManager.isKeyPressed("F") && this.curCoolDown < 0) {
            Game.instance.fireLaser()
        }
    }
}
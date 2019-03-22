"use strict";

/**
 * Class for the Rockets
 * Takes in input to move the player around the map
 */
class Rocket extends MeshObject {
    constructor(_name, position, renderData, player) {
        super(_name, position, renderData);

        glMatrix.quat.fromEuler(this.transform.rotation, 0, 0, 0)
        this.originalRotation = new Float32Array(4);
        glMatrix.quat.copy(this.originalRotation, this.transform.rotation)
        this.moveDir = new Vector3(0,1,0)
        this.originalMoveDir = new Float32Array([0,1,0])
        this.thrust = .5
        this.turnPower = -.2
        this.iFrames = 0; // Invincibility frames
        this.laserCoolDown = 1
        this.curCoolDown = 0
        this.collider = new BoxCollider(this.transform.position, 2, 2, 2)
        this.maxSpeed = 10
        this.drag = .2
        this.isStunned = false;
    }

    /**
     * Physics update the GameObject
     *
     * First read in input to apply forces, then call the parent fixedUpdate()
     * @param {deltaTime} float for the amount of seconds that have passed since the last fixedUpdate
     */
    fixedUpdate(deltaTime) {
        this.iFrames -= deltaTime
        var input = this.getInput();
        var deltaX = input.x
        var deltaZ = input.y

        var worldX = new Float32Array(4)
        glMatrix.quat.fromEuler(worldX, 90,0,0)
        var worldY = new Float32Array(4)
        glMatrix.quat.fromEuler(worldX, 0, 90,0)
        var worldZ = new Float32Array(4)
        glMatrix.quat.fromEuler(worldX,0,0, 90)

        // Rotate around the local Z axis to adjust yaw
        var deltaZRotation = new Float32Array(4)
        glMatrix.quat.fromEuler(deltaZRotation, 0, 0, deltaZ);
        glMatrix.quat.mul(this.transform.rotation, this.transform.rotation, deltaZRotation)

        // Rotate around the local X axis to adjust pitch
        var deltaXRotation = new Float32Array(4)
        glMatrix.quat.fromEuler(deltaXRotation, deltaX, 0, 0);
        glMatrix.quat.mul(this.transform.rotation, this.transform.rotation, deltaXRotation)

        // constantly rotate around local y
//        var deltaYRotation = new Float32Array(4)
//        glMatrix.quat.fromEuler(deltaYRotation, 0, 5, 0);
//         glMatrix.quat.mul(this.transform.rotation, this.transform.rotation, deltaYRotation)

        // Get the current move direction by rotating the original moveDir by the current player rotation
        var newMoveDir = new Float32Array(3);
        glMatrix.vec3.transformQuat(newMoveDir, this.originalMoveDir, this.transform.rotation)
        this.moveDir.x = newMoveDir[0]
        this.moveDir.y = newMoveDir[1]
        this.moveDir.z = newMoveDir[2]

        // Normalize velocity, and scale by expected speed
        if (this.iFrames < 0) {
            var magnitude = this.velocity.magnitude()
             this.velocity = this.moveDir.scaled(magnitude)

            // Don't apply drag if the player is pressing the gas pedal
            var shouldMove = this.shouldMove();
            if (shouldMove) {
                this.addForce(this.moveDir.scaled(this.thrust));
            }
        }


        super.fixedUpdate(deltaTime)
    }

    shouldMove() {
        return true;
    }

    getInput() {
        return new Vector3(0,0,0);
    }

    onCollisionEnter(other) {
        console.log(other.tag, " Hit rocket");
    }
}
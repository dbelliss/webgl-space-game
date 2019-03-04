'use strict';

/**
* Class for controlling the Camera
* @param {gl} OpenGL object
* @param {worldMatrix}
* @param {viewMatrix}
* @param {projMatrix}
*/
class Camera {
    constructor(gl, worldMatrix, viewMatrix, projMatrix) {
        this.gl = gl;
        this.worldMatrix = worldMatrix;
        this.viewMatrix = viewMatrix;
        this.projMatrix = projMatrix;
        this.relativePosition = new Vector3(0, 0, -20);
        this.distance = Math.sqrt(Math.pow(this.relativePosition.x, 2) + Math.pow(this.relativePosition.y, 2) + Math.pow(this.relativePosition.z, 2));
        this.c = new Vector3(0, 0, -1);
        this.xPeriod = 0;
        this.yPeriod = 0;
        Camera.instance = this;
        this.position = new Vector3(0,0,0)
        this.isShaking = false
        this.shakeEndTime = 0;
        this.shakeFrequency = .01;
        this.lastShakeTime = 0;
        this.offset = new Vector3(0,0,0);
    }

   /**
    * Moves the camera so that it is relative to a Player
    *
    * @param {gameObject} GameObject to stay relative to
    */
    trackObject(gameObject, dx, dy) {

        // Get camera position by maintaining the same relative distance from the player
        var v = new Vector3(gameObject.transform.position.x, gameObject.transform.position.y, gameObject.transform.position.z)
        v.add(gameObject.moveDir.normalized().scaled(-1 * this.distance))
        this.position = v
        if (this.isShaking) {
            var curTime = performance.now() / 1000
            if (curTime - this.lastShakeTime > this.shakeFrequency) {
                this.offset = Vector3.random(-.25, .25)
                this.lastShakeTime = curTime
            }
            this.position.add(this.offset);
            if (curTime > this.shakeEndTime) {
                this.isShaking = false
            }
        }

        // Default up vector
        var up = new Float32Array(3)
        up[2] = -1
        // Rotate up vector by player quaternion
        glMatrix.vec3.transformQuat(up, up, gameObject.transform.rotation)

        glMatrix.mat4.lookAt(this.viewMatrix,
                             [v.x, v.y, v.z],
                             [gameObject.transform.position.x, gameObject.transform.position.y, gameObject.transform.position.z],
                             up);
    }

    shake(length) {
        this.isShaking = true;
        this.shakeEndTime = performance.now() / 1000 + length
    }
}
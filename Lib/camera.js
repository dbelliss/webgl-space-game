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
        this.relativePosition = new Vector3(0, 0, -20)
        this.distance = Math.sqrt(Math.pow(this.relativePosition.x, 2) + Math.pow(this.relativePosition.y, 2) + Math.pow(this.relativePosition.z, 2))
        this.c = new Vector3(0, 0, -1);
        this.xPeriod = 0
        this.yPeriod = 0
    }

   /**
    * Moves the camera so that it is relative to a Player
    *
    * @param {gameObject} GameObject to stay relative to
    */
    trackObject(gameObject, dx, dy) {
        var v = new Vector3(gameObject.transform.position.x, gameObject.transform.position.y, gameObject.transform.position.z)
        v.add(gameObject.moveDir.normalized().scaled(-1 * this.distance))

        glMatrix.mat4.lookAt(this.viewMatrix,
                             [v.x, v.y, v.z],
                             [gameObject.transform.position.x, gameObject.transform.position.y, gameObject.transform.position.z],
                             [0, 1, 0]);
    }
}
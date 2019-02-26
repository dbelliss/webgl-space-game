'use strict';

class InputManager {
    static readInput() {
        var transformVector = new Vector3(0,0,0)
        if(key.isPressed("W")) {
            transformVector.y += 1
        }
        if (key.isPressed("S")) {
            transformVector.y += -1
        }

        if(key.isPressed("A")) {
            transformVector.x += -1
        }
        else if (key.isPressed("D")) {
            transformVector.x += 1
        }
        return transformVector
    }

    static readCameraInput() {
        var transformVector = new Vector3(0,0,0)
        var cameraSpeed = .01
        if(key.isPressed("Y")) {
            transformVector.y += cameraSpeed
        }
        if (key.isPressed("H")) {
            transformVector.y -= cameraSpeed
        }

        if(key.isPressed("G")) {
            transformVector.x += cameraSpeed
        }
        else if (key.isPressed("J")) {
            transformVector.x -= cameraSpeed
        }
        return transformVector
    }

    static isKeyPressed(_key) {
        return key.isPressed(_key)
    }
}
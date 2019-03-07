'use strict';

class InputManager {
    static readKeyboardInput() {
        var transformVector = new Vector3(0,0,0)
        if(key.isPressed("W")) {
            transformVector.x += 1
        }
        if (key.isPressed("S")) {
            transformVector.x += -1
        }

        if(key.isPressed("A")) {
            transformVector.y += 1
        }
        else if (key.isPressed("D")) {
            transformVector.y += -1
        }

        if(key.isPressed("Q")) {
            transformVector.z += -1
        }
        else if (key.isPressed("E")) {
            transformVector.z += 1
        }

        return transformVector
    }

    static readTouchInput() {
        var minSensitivity = Game.instance.canvasWidth / 8
        var maxSensitivity = Game.instance.canvasWidth / 2
        var transformVector = new Vector3(0,0,0)
        var deltaY = TouchControlManager.instance.deltaY;
        var deltaX = TouchControlManager.instance.deltaX;
        if(deltaY > minSensitivity) {
            var power = Math.min(maxSensitivity, deltaY)
            var diff = (power - minSensitivity)/(maxSensitivity - minSensitivity);
            transformVector.x += diff
        }
        if (deltaY < -minSensitivity) {
            var power = Math.min(maxSensitivity, -deltaY)
            var diff = (power - minSensitivity)/(maxSensitivity - minSensitivity);
            transformVector.x -= diff
        }

        if(deltaX > minSensitivity) {
            var power = Math.min(maxSensitivity, deltaX)
            var diff = (power - minSensitivity)/(maxSensitivity - minSensitivity);
            transformVector.y += diff
        }
        else if (deltaX < -minSensitivity) {
            var power = Math.min(maxSensitivity, -deltaX)
            var diff = (power - minSensitivity)/(maxSensitivity - minSensitivity);
            transformVector.y -= diff
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

    static shouldFireLaser() {
        if (TouchControlManager.instance.touchControlsEnabled) {
            if (Game.instance.shouldFireLaser) {
                Game.instance.shouldFireLaser = false;
                return true
            }
        }
        else {
            return this.isKeyPressed("F")
        }
    }

    static shouldMove() {
        if (TouchControlManager.instance.touchControlsEnabled) {
            if (Game.instance.shouldMove) {
                return true
            }
        }
        else {
            return this.isKeyPressed("space");
        }
    }
}
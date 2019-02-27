"use strict";

/**
 * Class to represent a vector in 3d space
 */
class Vector3 {
    constructor(_x, _y, _z) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
    }

    difference(other) {
        var v = new Vector3(0,0,0);
        v.x = this.x - other.x;
        v.y = this.y - other.y;
        v.z = this.z - other.z;
        return v;
    }


    scaled(scaleVal) {
        return new Vector3(this.x * scaleVal, this.y * scaleVal, this.z * scaleVal);
    }

    scale(scaleVal) {
        this.x *= scaleVal
        this.y *= scaleVal
        this.z *= scaleVal
    }

    static random(low, high) {
        return new Vector3(Math.random() * (high - low) + low, Math.random() * (high - low) + low, Math.random() * (high - low) + low);

    }

    static zero() {
        return new Vector3(0, 0, 0);
    }

    normalize() {
        var d = this.magnitude()
        this.x /= d;
        this.y /= d;
        this.z /= d;
    }

    normalized() {
        var d = this.magnitude()
        if (d == 0) {
            return this;
        }
        return new Vector3(this.x / d, this.y/d, this.z/d)
    }

    magnitude() {
        var d = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2))
        return d
    }

    distance(other) {
        var x = this.x - other.x
        var y = this.y - other.y
        var z = this.z - other.z

        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2))
    }
}

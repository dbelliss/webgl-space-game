class SphereCollider extends Collider {
    constructor(center, radius) {
        super()
        this.center = center
        this.radius = radius
        this.isSphere = true
    }
}
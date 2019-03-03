class BoxCollider extends Collider {
    constructor(center, xSize, ySize, zSize) {
        super()
        this.isBox = true
        this.center = center
        this.xSize = xSize/2
        this.ySize = ySize/2
        this.zSize = zSize/2
    }
}
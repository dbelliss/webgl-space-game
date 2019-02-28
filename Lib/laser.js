/**
 * Class for a laser GameObject
 */
class Laser extends MeshObject{
    constructor(_name, position, renderData, direction) {
        super(_name, position);
        this.transform.position = position;
        this.renderData = renderData
        this.speed = 100
        this.maxSpeed = 100
        this.drag = 0
        this.moveDir = direction.scaled(this.speed)
        this.despawnTime = 10
    }

    fixedUpdate(deltaTime) {
        this.despawnTime -= deltaTime
        this.velocity = this.moveDir
        super.fixedUpdate(deltaTime)
    }
}
/**
 * Class for a laser GameObject
 */
class Laser extends MeshObject{
    constructor(_name, position, renderData, direction) {
        super(_name, position);
        this.tag = "Laser";
        this.transform.position = position;
        this.renderData = renderData
        this.speed = 100
        this.maxSpeed = 100
        this.drag = 0
        this.moveDir = direction.scaled(this.speed)
        this.despawnTime = 5
    }

    fixedUpdate(deltaTime) {
        this.velocity = this.moveDir
        super.fixedUpdate(deltaTime)
        this.despawnTime -= deltaTime
        if (this.despawnTime <= 0) {
            console.log("Despawning laser");
            this.isDestroyed = true;
        }
    }
}
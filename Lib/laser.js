/**
 * Class for a laser GameObject
 */
class Laser extends MeshObject{
    constructor(_name, position, renderData, rotation, direction) {
        super(_name, position);
        this.tag = "Laser";
        this.transform.position = position;
        this.renderData = renderData
        this.speed = 100
        this.maxSpeed = 100
        this.drag = 0
        this.moveDir = direction.scaled(this.speed)
        this.despawnTime = 5

        this.transform.rotation = rotation
        this.transform.scale.scale(.3)
        this.transform.scale.y *= 3

        this.collider = new BoxCollider(this.transform.position, 1, 1, 1);
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

    onCollisionEnter(other) {
        if (other.tag == "Enemy") {
            console.log("Laser hit enemy")
            this.isDestroyed = true
        }
        else if (other.tag == "Asteroid") {
            console.log("Laser hit asteroid");
            this.isDestroyed = true
        }
        else if (other.tag == "Crate") {
            console.log("Laser hit crate");
            this.isDestroyed = true
        }
    }
}
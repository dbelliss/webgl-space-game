
class Skybox extends Crate {
    constructor(_name, position, texture, deltaRotation) {
        super(_name, position, texture, deltaRotation)
        this.transform.scale.scale(300);
        var skyboxRenderData = this.renderData[0].textureIndices
        for (var i = 0; i < skyboxRenderData.length; i++) {
            skyboxRenderData[i] *= 5
        }
        this.transform.rotation = new Vector3(0,0,0)
        this.player = Game.instance.player
        this.transform.position = this.player.transform.position
    }
}
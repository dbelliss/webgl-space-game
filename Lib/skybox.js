
class Skybox extends Crate {
    constructor(_name, position, texture, deltaRotation) {
        super(_name, position, texture, deltaRotation)
        this.tag = "Skybox";
        this.transform.scale.scale(300);
        var skyboxRenderData = this.renderData[0].textureIndices
        for (var i = 0; i < skyboxRenderData.length; i++) {
            skyboxRenderData[i] *= 5
        }
        this.player = Game.instance.player
        this.transform.position = this.player.transform.position
    }
}
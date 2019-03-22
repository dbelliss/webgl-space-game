class CollisionManager {
    constructor(gameObjectList) {
        if (CollisionManager.instance !== undefined) {
            console.error("Error: Two instances of CollisionManager were created");
            return;
        }
        CollisionManager.instance = this;
        this.spatialHash = {}
        this.cellSize = 20
        this.activeGameObjects = gameObjectList;
    }

    generateSpatialHash() {
        this.spatialHash = {}
        this.cellSize = 20
        var cellSize = this.cellSize
        var activeGameObjects = this.activeGameObjects
        var hash = {}
        var addToSpatialHash = this.addToSpatialHash
        Object.keys(activeGameObjects).forEach(function(key,index) {
                for (var gameObjectNum = 0; gameObjectNum < activeGameObjects[key].length; gameObjectNum++) {
                    var gameObject = activeGameObjects[key][gameObjectNum]
                    addToSpatialHash(gameObject)
                }
        });
        return hash;
    }

    addToSpatialHash(gameObject) {
        var hash = CollisionManager.instance.spatialHash;
        var cellSize = CollisionManager.instance.cellSize;
        var collider = gameObject.collider
        var isBox = collider.isBox;
        var isSphere = collider.isSphere;

        if (isBox) {
            var center = collider.center

            // Add one because every object could be on the boundary between 2 bounding cubes
            var xBlocks = Math.ceil(collider.xSize * 2 / cellSize)
            var yBlocks = Math.ceil(collider.ySize * 2 / cellSize)
            var zBlocks = Math.ceil(collider.zSize * 2 / cellSize)

            var startXBlock = Math.floor((collider.center.x - collider.xSize)/cellSize)
            var startYBlock = Math.floor((collider.center.y - collider.ySize)/cellSize)
            var startZBlock = Math.floor((collider.center.x - collider.zSize)/cellSize)

            var endXBlock = Math.ceil(startXBlock + xBlocks)
            var endYBlock = Math.ceil(startYBlock + yBlocks)
            var endZBlock = Math.ceil(startZBlock + zBlocks)
        }
        else {
            var center = collider.center

            // Add one because every object could be on the boundary between 2 bounding cubes
            var xBlocks = Math.ceil(collider.radius * 2 / cellSize)
            var yBlocks = Math.ceil(collider.radius * 2 / cellSize)
            var zBlocks = Math.ceil(collider.radius * 2 / cellSize)

            var startXBlock = Math.floor((collider.center.x - collider.radius)/cellSize)
            var startYBlock = Math.floor((collider.center.y - collider.radius)/cellSize)
            var startZBlock = Math.floor((collider.center.x - collider.radius)/cellSize)

            var endXBlock = Math.ceil(startXBlock + xBlocks)
            var endYBlock = Math.ceil(startYBlock + yBlocks)
            var endZBlock = Math.ceil(startZBlock + zBlocks)
        }
        // Add gameobject to all cells that might touch
        for (var i = 0; i < xBlocks; i++) {
            for (var j = 0; j < yBlocks; j++) {
                for (var k = 0; k < zBlocks; k++) {
                    if (hash[startXBlock + i] == undefined) {
                        hash[startXBlock + i] = {}
                    }
                    if (hash[startXBlock + i][startYBlock + j] == undefined) {
                        hash[startXBlock + i][startYBlock + j] = {}
                    }
                    if (hash[startXBlock + i][startYBlock + j][startZBlock + k] == undefined) {
                        hash[startXBlock + i][startYBlock + j][startZBlock + k] = []
                    }
                    hash[startXBlock + i][startYBlock + j][startZBlock + k].push(gameObject)
                    gameObject.spatialHashBuckets.push(hash[startXBlock + i][startYBlock + j][startZBlock + k])
                }
            }
        }
    }
}
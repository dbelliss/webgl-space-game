class Collider {
    constructor() {
        this.isSphere = false
        this.isBox = false
    }

    isCollidingWith(other) {
        if (this.isSphere && other.isSphere) {
            return this.checkSphereCollision(other);
        }
        else if (this.isBox && other.isBox) {
            return this.checkBoxCollision(other);
        }
        else {
            // Collision between sphere and box
            var sphere = null
            var box = null
            if (this.isBox) {
                box = this;
                sphere = other;
            }
            else {
                sphere = this;
                box = other;
            }
            return this.checkSphereCubeCollision(sphere, box)
        }
    }

    checkBoxCollision(b2) {
        var b1 = this
        //check the X axis
        if(Math.abs(b1.center.x - b2.center.x) < b1.xSize + b2.xSize)
        {
            //check the Y axis
            if(Math.abs(b1.center.y - b2.center.y) < b1.ySize + b2.ySize)
            {
                //check the Z axis
                if(Math.abs(b1.center.z - b2.center.z) < b1.zSize + b2.zSize)
                {
                 return true;
                }
            }
        }
        return false;
    }

    checkSphereCollision(s2) {
        var s1 = this;
        var netRadius = s1.radius + s2.radius
        var distanceBetweenCenters = s1.center.difference(s2.center).magnitude();
        return distanceBetweenCenters < netRadius
    }

    checkSphereCubeCollision(sphere, box) {
        var closest = new Vector3(0,0,0); // Closest point on box to the sphere
        var box_left_x = box.center.x - box.xSize
        var box_right_x = box.center.x + box.xSize
        var box_left_y = box.center.y - box.ySize
        var box_right_y = box.center.y + box.ySize
        var box_left_z = box.center.z - box.zSize
        var box_right_z = box.center.z + box.zSize

        if (sphere.center.x < box_left_x) {
            closest.x = box_left_x
        }
        else if(sphere.center.x > box_right_x) {
            closest.x = box_right_x;
        }
        else {
            closest.x = sphere.center.x;
        }

        if (sphere.center.y < box_left_y) {
            closest.y = box_left_y;
        }
        else if(sphere.center.y > box_right_y) {
            closest.y = box_right_y;
        }
        else {
            closest.y = sphere.center.y;
        }

        if (sphere.center.z < box_left_z) {
            closest.z = box_left_z;
        }
        else if(sphere.center.z > box_right_z) {
          closest.z = box_right_z;
        }
        else {
          closest.z = sphere.center.z;
        }

        var distanceBetween = Math.abs(sphere.center.difference(closest).magnitude())
        return distanceBetween < sphere.radius
    }
}

function TestSphereCollisions() {
    var origin = new Vector3(0,0,0);
    var sphere1 = new SphereCollider(origin, 5);
    var point1 = new Vector3(0,0,1);
    var sphere2 = new SphereCollider(point1, 5);

    var point2 = new Vector3(10,5,5)
    var sphere3 = new SphereCollider(point2, 1)

    if (!sphere1.isCollidingWith(sphere2)) {
        throw new Error("Error: Collision between 2 spheres not detected");
    }

    if (sphere2.isCollidingWith(sphere3)) {
        throw new Error("Error: Collision between spheres incorrectly detected");
    }

    if (!sphere2.isCollidingWith(sphere2)) {
        throw new Error("Error: Collision between same sphere not detected");
    }
    console.log("Successful sphere collision test");
}

function TestCubeCollision() {
    var origin = new Vector3(0,0,0);
    var box1 = new BoxCollider(origin, 2, 2, 2);

    if (!box1.isCollidingWith(box1)) {
        throw new Error("Error: Collision between same boxes not detected");
    }

    var point1 = new Vector3(1, 1, 1)
    var box2 = new BoxCollider(point1, 1, 1, 1);

    if (!box1.isCollidingWith(box2)) {
        throw new Error("Error: Collision between 2 boxes not detected");
    }

    if (!box2.isCollidingWith(box1)) {
        throw new Error("Error: Collision between 2 boxes not detected");
    }

    var point3 = new Vector3(5, 10, 6);
    var box3 = new BoxCollider(point3, 1, 1, 1);

    if (box1.isCollidingWith(box3)) {
        throw new Error("Error: Collision between 2 boxes incorrectly detected");
    }
    console.log("Successful box collision test");
}

function TestSphereCubeCollision() {
    var origin = new Vector3(0,0,0);
    var box1 = new BoxCollider(origin, 2, 2, 2);
    var sphere1 = new SphereCollider(origin, 5);
    var point1 = new Vector3(0,0,1);
    var sphere2 = new SphereCollider(point1, 5);

    var point2 = new Vector3(10,5,5)
    var sphere3 = new SphereCollider(point2, 1)

    if (!box1.isCollidingWith(sphere1)) {
        throw new Error("Error: Collision between box and sphere not detected");
    }

    if (!sphere1.isCollidingWith(box1)) {
        throw new Error("Error: Collision between sphere and box not detected");
    }

    if (box1.isCollidingWith(sphere3)) {
        throw new Error("Error: Collision between box and sphere incorrectly detected");
    }

    if (sphere3.isCollidingWith(box1)) {
        throw new Error("Error: Collision between sphere and box incorrectly detected");
    }
    console.log("Successful sphere box collision test");
}

function TestColliders() {
    TestCubeCollision();
    TestSphereCollisions();
    TestSphereCubeCollision();
    console.log("Successfully tested collisions");
}
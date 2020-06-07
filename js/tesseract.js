class Tesseract {
    constructor(scale=1, color=[1, 0, 0]) {
        this.vertices = [ [scale, scale, scale, scale] ];
        this.vertices.forEach(v => this.vertices.push( [-v[0], v[1], v[2], v[3]] ));
        this.vertices.forEach(v => this.vertices.push( [v[0], -v[1], v[2], v[3]] ));
        this.vertices.forEach(v => this.vertices.push( [v[0], v[1], -v[2], v[3]] ));
        this.vertices.forEach(v => this.vertices.push( [v[0], v[1], v[2], -v[3]] ));

        this.colors = [];
        this.vertices.forEach(v => this.colors.push(color));
    }

    colorCube(i=0, color=[0, 1, 0]) {
        let fixedValue = (i < 4) ? 1 : -1;
        let index = i % 4;

        for (let j = 0; j < this.vertices.length; j++) {
            if (this.vertices[j][index] == fixedValue) {
                this.colors[j] = color;
            }
        }
    }
}

function arrayContains(array, val) {
    for (arrayVal of array) {
        if (arrayVal.toString() === val.toString()) {
            return true;
        }
    }
    return false;
}

let tesseract = new Tesseract();
tesseract.colorCube();

// ---------------------------------------------------

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 6;

window.addEventListener('resize', function() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// ---------------------------------------------------

let geometry = new THREE.SphereBufferGeometry(0.05);
let vertexMeshes = [];
for (let i = 0; i < tesseract.vertices.length; i++) {
    let material = new THREE.MeshBasicMaterial( { color: tesseract.colors[i] } );
    let mesh = new THREE.Mesh(geometry, material);
    vertexMeshes.push(mesh);
    scene.add(mesh);
}

let t = 0;

let render = function () {
    requestAnimationFrame( render );

    for (let i = 0; i < tesseract.vertices.length; i++) {
        let v = tesseract.vertices[i];
        let vx = Math.cos(t) * v[0] - Math.sin(t) * v[3];
        let vw = Math.sin(t) * v[0] + Math.cos(t) * v[3];
        let vy = Math.cos(t + Math.PI / 2) * v[1] - Math.sin(t - Math.PI / 2) * v[2];
        let vz = Math.sin(t + Math.PI / 2) * v[1] + Math.cos(t - Math.PI / 2) * v[2];
        let stereography = 1 / (2 - vw);
        vertexMeshes[i].position.set(stereography * vx, stereography * vy, stereography * vz);
        //vertexMeshes[i].position.set(vx, vy, vz);

        vertexMeshes[i].material.color.fromArray(tesseract.colors[i]);
    }

    renderer.render(scene, camera);
    t += 0.01;
}

//debugger;
render();
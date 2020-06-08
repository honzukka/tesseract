class Tesseract {
    constructor(scale=1, color=[1, 0, 0]) {
        this.vertices = [ [scale, scale, scale, scale] ];
        this.vertices.forEach(v => this.vertices.push( [-v[0], v[1], v[2], v[3]] ));
        this.vertices.forEach(v => this.vertices.push( [v[0], -v[1], v[2], v[3]] ));
        this.vertices.forEach(v => this.vertices.push( [v[0], v[1], -v[2], v[3]] ));
        this.vertices.forEach(v => this.vertices.push( [v[0], v[1], v[2], -v[3]] ));

        this.colors = [];
        this.vertices.forEach(v => this.colors.push(color));

        this.edges = [];
        for (let i = 0; i < this.vertices.length; i++) {
            for (let j = i + 1; j < this.vertices.length; j++) {
                if (countDifferentCoords(this.vertices[i], this.vertices[j]) === 1) {
                    this.edges.push( [i, j] );
                }
            }
        }
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

function countDifferentCoords(vertex1, vertex2) {
    if (vertex1.length !== vertex2.length)
        return 0;
    
    counter = 0;
    for (let i = 0; i < vertex1.length; i++) {
        if (vertex1[i] !== vertex2[i])
            counter++;
    }

    return counter;
}

let tesseract = new Tesseract();

// ---------------------------------------------------

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 6;

let controls = new THREE.OrbitControls( camera, renderer.domElement );

let rotationSpeed = 0.01;

window.addEventListener('resize', function() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

let button = document.getElementById("button");
button.addEventListener('click', function() {
    if (rotationSpeed > 0.0)
        rotationSpeed = 0.0;
    else
        rotationSpeed = 0.01;
});


// ---------------------------------------------------

// vertex geometry
let vertexGeometry = new THREE.SphereBufferGeometry(0.05);
let vertexMeshes = [];
for (let i = 0; i < tesseract.vertices.length; i++) {
    let material = new THREE.MeshBasicMaterial( { color: tesseract.colors[i] } );
    let mesh = new THREE.Mesh(vertexGeometry, material);
    vertexMeshes.push(mesh);
    scene.add(mesh);
}

// edge geometry
let edgeLines = [];
for (let i = 0; i < tesseract.edges.length; i++) {
    let edge = tesseract.edges[i];
    let material = new THREE.LineBasicMaterial(
        { color: new THREE.Color().fromArray(tesseract.colors[edge[0]]) }
    );
    let points = [
        new THREE.Vector3().fromArray(tesseract.vertices[edge[0]]),
        new THREE.Vector3().fromArray(tesseract.vertices[edge[1]])
    ];
    let edgeGeometry = new THREE.BufferGeometry().setFromPoints( points );
    let line = new THREE.Line( edgeGeometry, material );
    edgeLines.push(line);
    scene.add(line);
}

tesseract.colorCube();

let render = function () {
    requestAnimationFrame( render );

    for (let i = 0; i < vertexMeshes.length; i++) {
        // vertex positions
        let v = tesseract.vertices[i];
        let vx = Math.cos(rotationSpeed) * v[0] - Math.sin(rotationSpeed) * v[3];
        let vw = Math.sin(rotationSpeed) * v[0] + Math.cos(rotationSpeed) * v[3];
        let vy = Math.cos(rotationSpeed) * v[1] - Math.sin(rotationSpeed) * v[2];
        let vz = Math.sin(rotationSpeed) * v[1] + Math.cos(rotationSpeed) * v[2];
        let stereography = 1 / (2 - vw);
        vertexMeshes[i].position.set(stereography * vx, stereography * vy, stereography * vz);
        //vertexMeshes[i].position.set(vx, vy, vz);

        // update tesseract vertices
        tesseract.vertices[i][0] = vx;
        tesseract.vertices[i][1] = vy;
        tesseract.vertices[i][2] = vz;
        tesseract.vertices[i][3] = vw;

        // color
        vertexMeshes[i].material.color.fromArray(tesseract.colors[i]);
    }

    for (let i = 0; i < edgeLines.length; i++) {
        let edge = tesseract.edges[i];
        let vertex1 = tesseract.vertices[edge[0]];
        let vertex2 = tesseract.vertices[edge[1]];
        let positions = edgeLines[i].geometry.attributes.position.array;
        let stereography1 = 1 / (2 - vertex1[3]);
        let stereography2 = 1 / (2 - vertex2[3]);
        positions[0] = vertex1[0] * stereography1;
        positions[1] = vertex1[1] * stereography1;
        positions[2] = vertex1[2] * stereography1;
        positions[3] = vertex2[0] * stereography2;
        positions[4] = vertex2[1] * stereography2;
        positions[5] = vertex2[2] * stereography2;

        edgeLines[i].geometry.attributes.position.needsUpdate = true;

        let color1 = tesseract.colors[edge[0]];
        let color2 = tesseract.colors[edge[1]];
        if (color1.toString() === color2.toString())
            edgeLines[i].material.color.fromArray(color1);
    }

    renderer.render(scene, camera);
}

render();
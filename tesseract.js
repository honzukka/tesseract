// TODO: rotation axis control
// TODO: stereography light control
// TODO: basic site description (look at Bootstrap 4 features like pop-up and so on)
// TODO: refactoring & best practices (check if WebGL is available, HTML metadata, ...)

const ProjectionEnum = Object.freeze({"orthographic": 1, "stereographic": 2});

class Tesseract {
    constructor(scale=1, color=[1, 0, 0], stereographyLightPos=2) {
        this.vertices = [ [scale, scale, scale, scale] ];
        this.vertices.forEach(v => this.vertices.push( [-v[0], v[1], v[2], v[3]] ));
        this.vertices.forEach(v => this.vertices.push( [v[0], -v[1], v[2], v[3]] ));
        this.vertices.forEach(v => this.vertices.push( [v[0], v[1], -v[2], v[3]] ));
        this.vertices.forEach(v => this.vertices.push( [v[0], v[1], v[2], -v[3]] ));

        this.rotatedVertices = [];
        this.vertices.forEach(v => this.rotatedVertices.push(v.slice(2)));

        this.basic_color = color;
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

        this.projection = ProjectionEnum.stereographic;
        this.stereographyLightPos = stereographyLightPos;

        this.rotationTheta = 0.0;
    }

    resetColor(color=[1, 0, 0]) {
        this.basic_color = color;
        for (let i = 0; i < this.vertices.length; i++)
            this.colors[i] = this.basic_color;
    }

    colorCube(i=0, color=[0, 1, 0]) {
        let fixedValue = (i < 4) ? 1 : -1;
        let index = i % 4;

        for (let j = 0; j < this.vertices.length; j++) {
            this.colors[j] = this.basic_color;
            if (this.vertices[j][index] == fixedValue) {
                this.colors[j] = color;
            }
        }
    }

    rotateAndProjectVertex(i) {
        let vx, vy, vz, vw;
        [vx, vy, vz, vw] = this.vertices[i];

        let vxNew = Math.cos(this.rotationTheta) * vx - Math.sin(this.rotationTheta) * vw;
        if (this.projection == ProjectionEnum.orthographic) {
            this.rotatedVertices[i] = [vxNew, vy, vz];
            return;
        }
        let vwNew = Math.sin(this.rotationTheta) * vx + Math.cos(this.rotationTheta) * vw;

        let stereography = 1 / (this.stereographyLightPos - vwNew);
        this.rotatedVertices[i] = [
            vxNew * stereography,
            vy * stereography,
            vz * stereography
        ];
    }

    getVertex(i) {
        return this.rotatedVertices[i];
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

window.addEventListener("resize", function() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

let rotationButton = document.getElementById("rotationButton");
rotationButton.addEventListener("click", function() {
    if (rotationSpeed > 0.0) {
        rotationSpeed = 0.0;
        rotationButton.innerHTML = "Resume rotation";
    } else {
        rotationSpeed = 0.01;
        rotationButton.innerHTML = "Pause rotation";
    }
    rotationButton.blur();
});

let colorDropdownButton = document.getElementById("colorDropdownButton");
document.getElementById("colorButtonNone").addEventListener("click", function () {
    colorDropdownButton.innerHTML = "Colored cube: None";
    tesseract.resetColor();
});
document.getElementById("colorButton1").addEventListener("click", function () {
    colorDropdownButton.innerHTML = "Colored cube: 1";
    tesseract.colorCube(0);
});
document.getElementById("colorButton2").addEventListener("click", function () {
    colorDropdownButton.innerHTML = "Colored cube: 2";
    tesseract.colorCube(1);
});
document.getElementById("colorButton3").addEventListener("click", function () {
    colorDropdownButton.innerHTML = "Colored cube: 3";
    tesseract.colorCube(2);
});
document.getElementById("colorButton4").addEventListener("click", function () {
    colorDropdownButton.innerHTML = "Colored cube: 4";
    tesseract.colorCube(3);
});
document.getElementById("colorButton5").addEventListener("click", function () {
    colorDropdownButton.innerHTML = "Colored cube: 5";
    tesseract.colorCube(4);
});
document.getElementById("colorButton6").addEventListener("click", function () {
    colorDropdownButton.innerHTML = "Colored cube: 6";
    tesseract.colorCube(5);
});
document.getElementById("colorButton7").addEventListener("click", function () {
    colorDropdownButton.innerHTML = "Colored cube: 7";
    tesseract.colorCube(6);
});
document.getElementById("colorButton8").addEventListener("click", function () {
    colorDropdownButton.innerHTML = "Colored cube: 8";
    tesseract.colorCube(7);
});

let projectionButton = document.getElementById("projectionButton");
projectionButton.addEventListener("click", function() {
    if (tesseract.projection == ProjectionEnum.orthographic) {
        tesseract.projection = ProjectionEnum.stereographic;
        projectionButton.innerHTML = "Switch to orthographic projection";
    } else {
        tesseract.projection = ProjectionEnum.orthographic;
        projectionButton.innerHTML = "Switch to stereographic projection";
    }
    projectionButton.blur();
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

let render = function () {
    requestAnimationFrame( render );

    for (let i = 0; i < vertexMeshes.length; i++) {
        tesseract.rotateAndProjectVertex(i);
        vertexMeshes[i].position.fromArray(tesseract.getVertex(i));

        // update colors
        vertexMeshes[i].material.color.fromArray(tesseract.colors[i]);
    }

    for (let i = 0; i < edgeLines.length; i++) {
        let edge = tesseract.edges[i];
        projectedVertex1 = tesseract.getVertex(edge[0]);
        projectedVertex2 = tesseract.getVertex(edge[1]);
        
        let positions = edgeLines[i].geometry.attributes.position.array;
        for (let j = 0; j < 3; j++) positions[j] = projectedVertex1[j];
        for (let j = 3; j < 6; j++) positions[j] = projectedVertex2[j % 3];
        edgeLines[i].geometry.attributes.position.needsUpdate = true;

        edgeLines[i].material.color.fromArray(tesseract.basic_color);
        let color1 = tesseract.colors[edge[0]];
        let color2 = tesseract.colors[edge[1]];
        if (color1.toString() === color2.toString())
            edgeLines[i].material.color.fromArray(color1);
    }

    renderer.render(scene, camera);
    tesseract.rotationTheta += rotationSpeed;
}

render();
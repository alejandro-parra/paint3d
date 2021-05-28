import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import Stats from "https://unpkg.com/three@0.126.1/examples/jsm/libs/stats.module.js";
import dat from "https://unpkg.com/three@0.126.1/examples/jsm/libs/dat.gui.module.js";
import {GLTFLoader} from "/js/GLTFLoader.js";

"use strict";

const kTotalTimeInterval = 100;

//GLOBAL VARIABLES
let camera1, camera2, camera3, camera4,
    cameraControls,
    clearedTokens,
    editMode = false,
    gridHelper,
    gui,
    execInterval,
    player,
    renderer,
    scene,
    stats;
let multiview = false
let camAway = 3.0;

let shapes = []; //{name: string, shape: Mesh, html: Html}
let collidableMeshList = [];

let eatenGems = [];

//FORM VALUES
let nameText = "";
let shapeType = "cube";

//CUSTOM JS FUNCTIONS
dat.GUI.prototype.removeFolder = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
    return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
}

function nameIsRepeated() {
    for(let shape of shapes) {
        if(shape.name === nameText){
            return true;
        }
    }
    return false;
}

//INIT FUNCTIONS
function setRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(new THREE.Color(0.2, 0.2, 0.35));
    renderer.setScissorTest(true);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}
function configureScene() {
    scene = new THREE.Scene();
    let fovy = 60.0;
    let aspectRatio = window.innerWidth / window.innerHeight;
    let nearPlane = 0.1;
    let farPlane = 10000.0;

    // MAIN CAMERA
    camera1 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
    camera1.position.set(0, 0, camAway);
    cameraControls = new OrbitControls(camera1, renderer.domElement);
    
    // LIGHTS
    let light = new THREE.HemisphereLight(0xffffff, 0x000000, 5);
    scene.add(light);
    // var light = new THREE.DirectionalLight(0xffffff, 0.95);
    // light.position.setScalar(1);
    // scene.add(light);
    // scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    //scene.add(new THREE.AxesHelper(2));
    
     // CAMERA 2(TOP VIEW)
     aspectRatio = window.innerWidth / 2 / window.innerHeight / 2;
     camera2 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
     camera2.position.set(0., camAway, 0.); 
     camera2.lookAt(scene.position);   
     camera2.up.set(0., 0., 2.);    

    // CAMERA 3 (FRONT VIEW)
    aspectRatio = window.innerWidth / 2 / window.innerHeight / 2;
    camera3 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
    camera3.position.set(0., 0., camAway); 
    camera3.lookAt(scene.position);   
    camera3.up.set(0., 2., 0.);    

     // CAMERA 4 (SIDE VIEW)
     aspectRatio = window.innerWidth / 2 / window.innerHeight / 2;
     camera4 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
     camera4.position.set(camAway, 0., 0.); 
     camera4.lookAt(scene.position);   
     camera4.up.set(0., 1., 0.); 
}
function appendStats() {
    let statsContainer = document.getElementById('statsContainer');
    stats = new Stats();
    stats.showPanel(0); //FPS
    stats.domElement.style.cssText = '';
    statsContainer.appendChild(stats.dom);
}
function addGrid() {
    gridHelper = new THREE.GridHelper( 200, 200 );
    scene.add(gridHelper);
}
function bind() {
    const shapeSelect = document.getElementById('shapeSelect');
    shapeSelect.addEventListener('input', updateShapeType);
    const createButton = document.getElementById('createButton');
    createButton.onclick = function(){createShape()};
    const showStats = document.getElementById('showStats');
    showStats.addEventListener('input', changeStatsVisibility);
    const showFloor = document.getElementById('showFloor');
    showFloor.addEventListener('input', changeGridVisibility);

    const selectCode = document.getElementById('selectCode');
    const sourceCode = document.getElementById('sourceCode');
    var sourceCodeTokens = [];
    const selectCodeWhileIf = document.getElementById('selectCodeWhileIf');
    const extraSourceCode = document.getElementById('extraSourceCode');
    var extraSourceCodeTokens = [];
    const numberInput = document.getElementById('numberInput');

    const addExtraCodeBtn = document.getElementById('addExtraCodeBtn');
    const addCodeBtn = document.getElementById('addCodeBtn');
    const clearCodeBtn = document.getElementById('clearCodeBtn');
    const clearExtraCodeBtn = document.getElementById('clearExtraCodeBtn');
    const executeCodeBtn = document.getElementById('executeCodeBtn');

    selectCode.addEventListener('change', () => {
        extraSourceCodeTokens = [];
        if(selectCode.value==="for"){
            selectCodeWhileIf.hidden = false;
            
            extraSourceCode.hidden = false;
            extraSourceCode.value = "";
            
            numberInput.hidden = false;
            numberInput.value = "";
            
            addExtraCodeBtn.hidden = false;
            clearExtraCodeBtn.hidden = false;
        } else {
            numberInput.hidden = true;
            numberInput.value = -1;
            selectCodeWhileIf.hidden = true;
            extraSourceCode.hidden = true;
            extraSourceCode.value = "";
            addExtraCodeBtn.hidden = true;
            clearExtraCodeBtn.hidden = true;
        }
    });

    addExtraCodeBtn.onclick = () => {
        extraSourceCodeTokens.push(selectCodeWhileIf.value);
        extraSourceCode.value = '';
        extraSourceCodeTokens.forEach(element => {
            switch (element) {
                case 'front':
                    extraSourceCode.value += 'Move(Front)\r\n';
                    break;

                case 'back':
                    extraSourceCode.value += 'Move(Back)\r\n';
                    break;

                case 'right':
                    extraSourceCode.value += 'Move(Right)\r\n';
                    break;

                case 'left':
                    extraSourceCode.value += 'Move(Left)\r\n';
                    break;

                case 'up':
                    extraSourceCode.value += 'Move(Up)\r\n';
                    break;

                case 'down':
                    extraSourceCode.value += 'Move(Down)\r\n';
                    break;

                default:
                    break;
            }
        });
    }

    addCodeBtn.onclick = () => {
        if(selectCode.value==="for"){
            var codeBlock = [];
            codeBlock.push(numberInput.value);

            extraSourceCodeTokens.forEach(element => {
                codeBlock.push(element);
            });

            sourceCodeTokens.push(codeBlock);
            extraSourceCode.value = '';
            extraSourceCodeTokens = [];
            numberInput.value = '';
            sourceCode.value = '';
        } else {
            sourceCodeTokens.push(selectCode.value);
        }
        sourceCode.value = '';
        console.log(sourceCodeTokens);
        sourceCodeTokens.forEach(element => {
            switch (element) {
                case 'front':
                    sourceCode.value += 'Move(Front)\r\n';
                    break;

                case 'back':
                    sourceCode.value += 'Move(Back)\r\n';
                    break;

                case 'right':
                    sourceCode.value += 'Move(Right)\r\n';
                    break;

                case 'left':
                    sourceCode.value += 'Move(Left)\r\n';
                    break;

                case 'up':
                    sourceCode.value += 'Move(Up)\r\n';
                    break;

                case 'down':
                    sourceCode.value += 'Move(Down)\r\n';
                    break;

                default:
                    sourceCode.value += 'For{\r\n';
                    for (let i = 0; i < element.length; i++) {
                        switch (element[i]) {
                            case 'front':
                                sourceCode.value += '  Move(Front)\r\n';
                                break;
        
                            case 'back':
                                sourceCode.value += '  Move(Back)\r\n';
                                break;
        
                            case 'right':
                                sourceCode.value += '  Move(Right)\r\n';
                                break;
        
                            case 'left':
                                sourceCode.value += '  Move(Left)\r\n';
                                break;
        
                            case 'up':
                                sourceCode.value += '  Move(Up)\r\n';
                                break;

                            case 'down':
                                sourceCode.value += '  Move(Down)\r\n';
                                break;

                            default:
                                sourceCode.value += '  Iteración: ' + element[i] + '\r\n'
                                break;
                        }
                    }
                    sourceCode.value += '}\r\n';
                    break;
            }
        });
    }

    clearCodeBtn.onclick = () => {
        sourceCode.value = '';
        sourceCodeTokens = [];
    }

    clearExtraCodeBtn.onclick = () => {
        extraSourceCode.value = '';
        extraSourceCodeTokens = [];
    }

    executeCodeBtn.onclick = () => {
        clearedTokens = [];

        for(let token of sourceCodeTokens){
            if(typeof token === 'object'){
                for(let iterations = 0; iterations < token[0]; iterations++){
                    for(let forToken = 1; forToken < token.length; forToken++){
                        for(let index = 0; index < kTotalTimeInterval; index++) {
                            clearedTokens.push(token[forToken]);
                        }
                        for(let index = 0; index < kTotalTimeInterval; index++) {
                            clearedTokens.push('empty');
                        }
                    }
                }
            } else {
                for(let index = 0; index < kTotalTimeInterval; index++) {
                    clearedTokens.push(token);
                }
                for(let index = 0; index < kTotalTimeInterval; index++) {
                    clearedTokens.push('empty');
                }
            }
        }

        let i = 0;
        const unitToMove = 0.01;
        
        function tokens(){
            switch (clearedTokens[i++]) {
                case 'front':
                    player.position.x += unitToMove;
                    player.rotation.y = 90*Math.PI/180;
                    break;

                case 'back':
                    player.position.x -= unitToMove;
                    player.rotation.y = 270*Math.PI/180;
                    break;

                case 'right':
                    player.position.z += unitToMove;
                    player.rotation.y = 0*Math.PI/180;
                    break;

                case 'left':
                    player.position.z -= unitToMove;
                    player.rotation.y = 180*Math.PI/180;
                    break;

                case 'up':
                    player.position.y += unitToMove;
                    break;

                case 'down':
                    player.position.y -= unitToMove;
                    break;

                default:

                    break;
            }
            if(i >= clearedTokens.length){
                clearInterval(execInterval);

                // CLEAR CODE
                sourceCode.value = '';
                sourceCodeTokens = [];

                extraSourceCode.value = '';
                extraSourceCodeTokens = [];
            }
        }

        execInterval = setInterval(tokens, 1);
    }
}

//SHAPE CREATION BUILDERS

async function createIronMan() {
    return new Promise((resolve, reject) => {
        // MODEL
        let loader = new GLTFLoader();
        loader.load('./models/mario/scene.gltf', function (gltf) {
            player = gltf.scene ;
            player.scale.set(0.03, 0.03, 0.03);
            player.position.y = 0.24;
            player.rotation.y = 90*Math.PI/180;
            // SCENE HIERARCHY
            scene.add(player);
            resolve(true);
        });
    });
}

function configureDiamond() {
    let vertices = [
        0,0,0,
        0.5,0,0,
        0,0,0.5,
        0.5,0,0.5,
        0.25,0.5,0.25,
        0.25,-0.5,0.25
    ];
    let indices = [
        0,1,2,
        2,1,3,
        0,1,4,
        0,2,4,
        2,3,4,
        3,1,4,
        0,1,5,
        0,2,5,
        2,3,5,
        3,1,5,
    ];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "lime", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureCube() {
    let geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var mat = new THREE.MeshStandardMaterial({color: "red"});
    var mat = new THREE.MeshStandardMaterial({color: "red", transparent: true});
    var mesh = new THREE.Mesh(geometry, mat);
    mesh.name = nameText;
    return mesh;
}

function configureWall() {
    // MATERIAL
    let geometry = new THREE.BoxGeometry(0.2, 1, 3);
    let n = geometry.attributes.position.count; // number of vertices
    let colors = new Float32Array(n * 3);
    for(let i = 0; i < n*3; i++) {
        colors[i] = Math.random();
    }
    geometry.setAttribute("colors", new THREE.BufferAttribute(colors, 3));

    // MATERIAL
    let material = new THREE.ShaderMaterial( {
        uniforms: {
            color: {
                value: new THREE.Color(1.0, 1.0, 1.0)
            },
            alpha: {
                value: 1.0
            }
        },
        vertexShader:   document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        transparent: true
    });
    
    var mesh = new THREE.Mesh(geometry, material);
    mesh.name = nameText;
    return mesh
}

//EVENT HANDLERS
function addMenuFor(shape, shapeName) {
    let shapeModel = {
        rotY: shape.rotation.y * Math.PI / 180,
        rotX: shape.rotation.x * Math.PI / 180,
        rotZ: shape.rotation.z * Math.PI / 180,
        posHome: () => {
        shape.position.x = 0;
        shape.position.y = 0;
        shape.position.z = 0;
        },
        rotHome: () => {
        shapeModel.rotY = 0;
        shape.rotation.y = 0;
        shapeModel.rotX = 0;
        shape.rotation.x = 0;
        shapeModel.rotZ = 0;
        shape.rotation.z = 0;
        },
        colorList: ["White", "Red", "Yellow", 'Blue'],
        defaultColor: "White",
        colorPalette: [1, 1, 1]
    }
    
    let shapePositionMenu = gui.addFolder(`${shapeName} Position`);
    let shapeRotationMenu = gui.addFolder(`${shapeName} Rotation`);
    let shapePropertiesMenu = gui.addFolder(`${shapeName} Properties`);
    shapePositionMenu.add(shape.position, "x").min(-5).max(5).setValue(0).step(0.5).name("X").listen();
    shapePositionMenu.add(shape.position, "y").min(-5).max(5).setValue(0).step(0.5).name("Y").listen();
    shapePositionMenu.add(shape.position, "z").min(-5).max(5).setValue(2).step(0.5).name("Z").listen();
    shapeRotationMenu.add(shapeModel, "rotX").min(-180).step(10).max(180).setValue(0).name("X (deg)").listen().onChange((value) => {
        shape.rotation.x = shapeModel.rotX * Math.PI / 180;
    });
    shapeRotationMenu.add(shapeModel, "rotY").min(-180).step(10).max(180).setValue(0).name("Y (deg)").listen().onChange((value) => {
        shape.rotation.y = shapeModel.rotY * Math.PI / 180;
    });
    shapeRotationMenu.add(shapeModel, "rotZ").min(-180).step(10).max(180).setValue(0).name("Z (deg)").listen().onChange((value) => {
        shape.rotation.z = shapeModel.rotZ * Math.PI / 180;
    });
    shapePositionMenu.add(shapeModel, 'posHome').name("Reset");
    shapeRotationMenu.add(shapeModel, 'rotHome').name("Reset");
    shapePropertiesMenu.add(shape.material, "wireframe").setValue(false).name("Wireframe");
    shapePropertiesMenu.add(shapeModel, "defaultColor", shapeModel.colorList).name("Color list").onChange((item) => {
        shape.material.color = new THREE.Color(shapeModel.defaultColor.toLowerCase());
        shapeModel.colorPalette = [shape.material.color.r, shape.material.color.g, shape.material.color.b]
    });
    shapePropertiesMenu.addColor(shapeModel, "colorPalette").name("Color palette").listen().onChange((color) => {
        shape.material.color = new THREE.Color(color[0]/255, color[1]/255, color[2]/255);
    });
    shape.material.transparent = true;
    shapePropertiesMenu.add(shape.material, "opacity").min(0).max(1).step(0.01).setValue(1).name("Opacity").listen().onChange((value) => {
        shape.material.opacity = value;
    });
}

function updateNameText(name) {
    nameText = name;
}

function updateShapeType(event) {
    shapeType = event.target.value;
}

function createShape() {
    let newShape;
    if(shapeType === 'wall') {
        newShape = addWallToScene(1, 1);
    } 
    else if(shapeType === 'gem') {
        newShape = addGemToScene(1, 1);
    }
    else {
        alert('Seleccione una figura');
        return;
    } 
    addMenuFor(newShape, newShape.name);
    let html = getHtmlShapeCell();
    let newShapeObject = {
        name: nameText,
        shape: newShape,
        html: html
    };
    shapes.push(newShapeObject);
}

function getHtmlShapeCell() {
    let shapeList = document.getElementById('shapesList');
    shapeList.innerHTML += `<div class="shape"><p class="shape-title">${nameText}</p><button type="button" class="shape-remove" id="${nameText}">Borrar</button></div>`;
    let newCell = document.getElementById(nameText);
    newCell.addEventListener('click', deleteShape);
    return `<div class="shape"><p class="shape-title">${nameText}</p><button type="button" class="shape-remove" id="${nameText}">Borrar</button></div>`;
}

async function deleteShape(event) {
    console.log(event.target.id)
    for(let [index, shape] of shapes.entries()) {
        if(shape.name === event.target.id) {
            scene.remove(scene.getObjectByName(shape.name));
            gui.removeFolder(`${shape.name} Position`);
            gui.removeFolder(`${shape.name} Rotation`);
            gui.removeFolder(`${shape.name} Properties`);
            shapes.splice(index, 1);
            renderHtmlList();
            return
        }
    }
}

function renderHtmlList() {
    let newList = "";
    for(let shape of shapes){
        newList += shape.html;
    }
    let shapeList = document.getElementById('shapesList');
    shapeList.innerHTML = newList;
}

function changeGridVisibility(event){
    gridHelper.visible = event.target.checked;
}

function changeStatsVisibility(event) {
    if(event.target.checked){
        stats.domElement.style.visibility = 'visible';
    } else {
        stats.domElement.style.visibility = 'hidden';
    }
}

function setBackgroundColorController() {
    let background = {
        palette: [1,1,1]
    };
    gui.addColor(background, "palette").name("Scene Background").onChange((item) => {
        scene.background = new THREE.Color(item[0]/256, item[1]/256, item[2]/256);
    });
}

//UI UPDATE GENERAL METHODS
function renderLoop() {
    stats.begin();
    if(!multiview) {
        // CAMERA 1
        camera1.aspect =  window.innerWidth / window.innerHeight;
        camera1.updateProjectionMatrix();
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
        renderer.render(scene, camera1);
   } 
   else {
       // CAMERA 1
       camera1.aspect = window.innerWidth/2. /  (window.innerHeight/2);
       camera1.updateProjectionMatrix();
      
       renderer.setViewport(window.innerWidth/2., window.innerHeight/2, window.innerWidth/2., window.innerHeight/2);
       renderer.setScissor(window.innerWidth/2., window.innerHeight/2, window.innerWidth/2., window.innerHeight/2);
       renderer.render(scene, camera1);

       // CAMERA 2
       camera2.aspect = window.innerWidth/2. / (window.innerHeight/2);
       camera2.updateProjectionMatrix();
       renderer.setViewport(0, window.innerHeight/2, window.innerWidth/2., window.innerHeight/2);
       renderer.setScissor(0, window.innerHeight/2, window.innerWidth/2., window.innerHeight/2);
       renderer.render(scene, camera2);

       // CAMERA 3
       camera3.aspect = window.innerWidth/2. / (window.innerHeight/2);
       camera3.updateProjectionMatrix();
       renderer.setViewport(0, 0, window.innerWidth/2., window.innerHeight/2);
       renderer.setScissor(0, 0, window.innerWidth/2., window.innerHeight/2);
       renderer.render(scene, camera3);

       // CAMERA 4
       camera4.aspect = window.innerWidth/2. / (window.innerHeight/2);
       camera4.updateProjectionMatrix();
       renderer.setViewport(window.innerWidth/2, 0, window.innerWidth/2., window.innerHeight/2);
       renderer.setScissor(window.innerWidth/2, 0, window.innerWidth/2., window.innerHeight/2);
       renderer.render(scene, camera4);
   }
    updateScene();
    stats.end();
    stats.update();
    requestAnimationFrame(renderLoop);
}
function updateScene() {
    if (!editMode) {
        runCollisionDetector();
    }
}

function runCollisionDetector() {
    // collision detection:
    //   determines if any of the rays from the cube's origin to each vertex
    //		intersects any face of a mesh in the array of target meshes
    //   for increased collision accuracy, add more vertices to the cube;
    //		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
    //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    let originPoint = player.position.clone();
    const position = player.position;
    const vector = new THREE.Vector3();

    for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex++) {
        let localVertexVec = vector.fromBufferAttribute(position, vertexIndex);
        let localVertex = localVertexVec.clone();
        let globalVertex = localVertex.applyMatrix4(player.matrix);
        let directionVector = globalVertex.sub(player.position);

        let ray = new THREE.Raycaster(
            originPoint,
            directionVector.clone().normalize()
        );

        let collisionResults = ray.intersectObjects(collidableMeshList);
        if (
            collisionResults.length > 0 &&
            collisionResults[0].distance < directionVector.length()
        ) {
            if (collisionResults[0].object.name.includes("wall")) {
                // TRY AGAIN
                clearInterval(execInterval);
                player.position.x = 0;
                player.position.z = 0;

                for (let eatenGem of eatenGems) {
                    scene.add(eatenGem);
                }
            }
            if (collisionResults[0].object.name.includes("gem")) {
                // ADD POINTS
                const gem = collisionResults[0].object;
                scene.remove(gem);
                eatenGems.push(gem);
            }
        }
    }
}

function addWallToScene(x, z, rotY = 0, name = "wall") {
    if (name === "wall") {
        name += collidableMeshList.length.toString();
    }
    let wall = configureWall();
    wall.position.x = x;
    wall.position.y = 0.5
    wall.position.z = z;

    wall.rotation.y = rotY * Math.PI / 180;
    wall.name = name;
    updateNameText(wall.name);

    wall.material.wireframe = false;
    collidableMeshList.push(wall);
    scene.add(wall);
    return wall;
}

function addGemToScene(x, z, name = "gem") {
    if (name === "gem") {
        name += collidableMeshList.length.toString();
    }
    let gem = configureDiamond();
    gem.position.x = x;
    gem.position.y = 0.5
    gem.position.z = z;
    gem.name = name;
    updateNameText(gem.name);
    gem.material.wireframe = false;
    collidableMeshList.push(gem);
    scene.add(gem);
    return gem;
}

//CONSTRUCTOR
async function init() {
    toggleMode();

    setRenderer();
    configureScene();
    appendStats();
    addGrid();
    bind();
    gui = new dat.GUI(); 
    setBackgroundColorController();
    await createIronMan();

    addWallToScene(3, 1.5, 90);
    addWallToScene(-3, 0.5);
    addWallToScene(-2, -4, 90);
    addGemToScene(-2, -3);
    addGemToScene(-2,3);
    addGemToScene(3,2);
    addGemToScene(4,-1);
    
    renderLoop();
}

// EVENT LISTENERS
document.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", function() {
    if(!multiview) {
        // CAMERA 1
        camera1.aspect = window.innerWidth / window.innerHeight;
        camera1.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
   }
   else {
        // CAMERA 1
        camera1.aspect = window.innerWidth / 2. / (window.innerHeight / 2);
        camera1.updateProjectionMatrix();
       // CAMERA 2
        camera2.aspect = window.innerWidth / 2. / (window.innerHeight / 2);
        camera2.updateProjectionMatrix();
        // CAMERA 3
        camera3.aspect = window.innerWidth / 2. / (window.innerHeight / 2);
        camera3.updateProjectionMatrix();
        // CAMERA 4
        camera4.aspect = window.innerWidth / 2. / (window.innerHeight / 2);
        camera4.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
   }
});

// Toggle mode
function toggleMode() {
    const modeButton = document.getElementById("modeButton");
    
    modeButton.addEventListener('click', function() {
        editMode = !editMode;
        toggleModeButton();
    });

    toggleModeButton();

}

function toggleModeButton() {
    const codeSection = document.getElementById("code-section");
    const editSection = document.getElementById("edit-section");
    if (editMode) {
        codeSection.style.display = "none";
        editSection.style.display = "flex";
    } else {
        codeSection.style.display = "flex"
        editSection.style.display = "none";
    }
}

document.addEventListener("keydown", (ev) => {
    if(ev.key == " ")	// Space bar
	{
		multiview = !multiview;
	}
}, false);
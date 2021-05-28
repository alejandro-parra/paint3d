import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import Stats from "https://unpkg.com/three@0.126.1/examples/jsm/libs/stats.module.js";
import dat from "https://unpkg.com/three@0.126.1/examples/jsm/libs/dat.gui.module.js";

//GLOBAL VARIABLES
let renderer, scene, camera, cameraControls, stats, gui, gridHelper, player;
let shapes = []; //{name: string, shape: Mesh, html: Html}
let collidableMeshList = [];

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
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}
function configureScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 100);
    camera.position.set(4, 1, 3);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    var light = new THREE.DirectionalLight(0xffffff, 0.95);
    light.position.setScalar(1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    //scene.add(new THREE.AxesHelper(2));
}
function appendStats() {
    let statsContainer = document.getElementById('statsContainer');
    stats = new Stats();
    stats.showPanel(0); //FPS
    stats.domElement.style.cssText = '';
    statsContainer.appendChild(stats.dom);
}
function addGrid() {
    gridHelper = new THREE.GridHelper( 10, 15 );
    scene.add(gridHelper);
}
function bind() {
    const nameInput = document.getElementById('nameInput');
    nameInput.addEventListener('input', updateNameText);
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

                case 'jump':
                    extraSourceCode.value += 'Jump()\r\n';
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
                    sourceCode.value += '  Move(Up)\r\n';
                    break;

                case 'down':
                    sourceCode.value += '  Move(Down)\r\n';
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
        let clearedTokens = [];

        for(let token of sourceCodeTokens){
            if(typeof token === 'object'){
                for(let iterations = 0; iterations < token[0]; iterations++){
                    for(let forToken = 1; forToken < token.length; forToken++){
                        clearedTokens.push(token[forToken]);
                    }
                }
            } else {
                clearedTokens.push(token);
            }
        }

        let i = 0;
        const unitToMove = 1;
        
        function tokens(){
            switch (clearedTokens[i++]) {
                case 'front':
                    player.position.x += unitToMove;
                    break;

                case 'back':
                    player.position.x -= unitToMove;
                    break;

                case 'right':
                    player.position.z += unitToMove;
                    break;

                case 'left':
                    player.position.z -= unitToMove;
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
                clearInterval(intr);
            }
        }

        let intr = setInterval(tokens, 1000);
    }
}

//SHAPE CREATION BUILDERS
function configurePyramid() {
    let vertices = [-0.5, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0,
        0,0,0.5
    ];
    let indices = [0,1,2, 0,2,3, 4,1, 2,4, 3];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureRoof() {
    let vertices = [
        -0.5, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0,
        0 , 0.5, 0.5,
        0 , -0.5, 0.5
    ];
    let indices = [0,1,2, 0,2,3, 4,3, 0,1,5, 2, 4, 5, 0, 1, 5,0];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureTetris() {
    let vertices = [
        0,0,0,
        0.5,0,0,
        0.5,0.5,0,
        0,0.5,0,
        0,0.5,0.5,
        0.5,0.5,0.5,
        0.5,1,0.5,
        0,1,0.5,
        0,1,1,
        0.5,1,1,
        0.5,0.5,1,
        0,0.5,1,
        0,0.5,1.5,
        0.5,0.5,1.5,
        0,0,1.5,
        0.5,0,1.5
    ];
    let indices = [
        0,1,2, 
        3,0,2, 
        3,4,2, 
        4,2,5, 
        4,5,7, 
        5,6,7,
        5,6,10,
        9,6,10,
        7,6,8,
        8,6,9,
        4,7,11,
        8,7,11,
        8,11,9,
        11,10,9,
        11,10,13,
        11,12,13,
        12,14,13,
        14,15,13,
        2,1,15,
        13,15,2,
        0,3,14,
        14,12,3,
        0,1,14,
        14,15,1
    ];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureStairs() {
    let vertices = [
        0,0,0,
        0.5,0,0,
        0.5,0.5,0,
        0,0.5,0,
        0,0.5,0.5,
        0.5,0.5,0.5,
        0.5,1,0.5,
        0,1,0.5,
        0,1,1,
        0.5,1,1,
        0.5,0.5,1,
        0,0.5,1,
        0,0.5,1.5,
        0.5,0.5,1.5,
        0,0,1.5,
        0.5,0,1.5,
        0,1.5,1,
        0,1.5,1.5,
        0.5,1.5,1.5,
        0.5,1.5,1
    ];
    let indices = [
        0,1,2, 
        3,0,2, 
        3,4,2, 
        4,2,5, 
        4,5,7, 
        5,6,7,
        5,6,10,
        9,6,10,
        7,6,8,
        8,6,9,
        4,7,11,
        8,7,11,
        8,11,9,
        11,10,9,
        11,10,13,
        11,12,13,
        12,14,13,
        14,15,13,
        2,1,15,
        13,15,2,
        0,3,14,
        14,12,3,
        0,1,14,
        14,15,1,
        11,16,19,
        19,10,11,
        19,10,13,
        19,18,13,
        16,11,12,
        16,17,12,
        12,17,18,
        13,18,12,
        19,16,17,
        17,19,18
    ];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
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
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureTable() {
    let vertices = [
        0,0,0,
        0.5,0,0,
        0,1,0,
        0.5,1,0,
        0.5,0,0.5,
        0,0,0.5,
        0,0.5,0.5,
        0.5,0.5,0.5,
        0.5,0.5,1,
        0,0.5,1,
        0,0,1,
        0.5,0,1,
        0.5,0,1.5,
        0,0,1.5,
        0.5,1,1.5,
        0,1,1.5,
        0.5,0.5,0,
        0,0.5,0,
        0,0.5,1.5,
        0.5,0.5,1.5
    ];
    let indices = [
        0,2,1,
        2,1,3,
        0,1,4,
        0,5,4,
        6,5,4,
        4,7,6,
        6,7,9,
        7,9,8,
        9,10,8,
        10,8,11,
        10,11,13,
        11,13,12,
        13,15,12,
        12,15,14,
        2,3,14,
        14,3,15,
        3,16,19,
        14,3,19,
        1,4,7,
        1,16,7,
        11,12,19,
        11,8,19,
        2,17,15,
        17,15,18,
        0,17,6,
        0,5,6,
        9,10,18,
        10,18,13
    ];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureL() {
    let vertices = [
        0,0,0,
        0.5,0,0,
        0,0,1,
        0.5,0,1,
        0.5,0.5,1,
        0,0.5,1,
        0,0.5,0.5,
        0.5,0.5,0.5,
        0.5,1,0.5,
        0,1,0.5,
        0,1,0,
        0.5,1,0,
        0.5,0,0.5,
        0,0,0.5
    ];
    let indices = [
        0,1,2,
        1,2,3,
        0,1,10,
        10,1,11,
        1,12,8,
        1,11,8,
        0,13,9,
        0,9,10,
        10,11,9,
        11,9,8,
        2,4,3,
        5,2,4,
        12,3,4,
        12,7,4,
        13,6,2,
        2,6,5,
        6,5,7,
        7,5,4,
        6,8,9,
        6,7,8
    ];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureArrow() {
    let vertices = [
        0,0,0,
        0.5,0,0,
        0,0,0.5,
        0.5,0,0.5,
        0,0.5,0.25,
        0.5,0.5,0.25,
        0.5,0.5,0.75,
        0,0.5,0.75,
        0,1,0,
        0.5,1,0,
        0,1,0.5,
        0.5,1,0.5
    ];
    let indices = [
        0,1,2,
        1,2,3,
        0,4,1,
        4,5,1,
        1,5,3,
        3,5,6,
        0,4,2,
        4,2,7,
        2,7,6,
        2,6,3,
        4,8,9,
        4,9,5,
        9,5,6,
        9,11,6,
        7,10,11,
        7,6,11,
        8,7,10,
        8,4,7,
        8,9,10,
        9,10,11
    ];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureAdd() {
    let vertices = [
        0,0,0,
        0.5,0,0,
        0,0,0.5,
        0.5,0,0.5,
        0,0.5,0.5,
        0.5,0.5,0.5,
        0.5,0.5,0,
        0,0.5,0,
        0,0.5,-0.5,
        0.5,0.5,-0.5,
        0,1,-0.5,
        0.5,1,-0.5,
        0,1,0,
        0.5,1,0,
        0,1,0.5,
        0.5,1,0.5,
        0,1,1,
        0.5,1,1,
        0,0.5,1,
        0.5,0.5,1,
        0,1.5,0,
        0.5,1.5,0,
        0,1.5,0.5,
        0.5,1.5,0.5
    ];
    let indices = [
        0,1,2,
        1,2,3,
        0,7,1,
        7,6,1,
        2,4,3,
        4,5,3,
        1,6,3,
        6,5,3,
        0,7,4,
        4,2,0,
        6,8,7,
        6,8,9,
        8,9,10,
        10,9,11,
        9,11,13,
        9,6,13,
        8,10,12,
        8,7,12,
        10,12,11,
        12,11,13,
        6,13,15,
        6,5,15,
        7,12,14,
        7,4,14,
        4,14,16,
        4,18,16,
        5,19,17,
        5,15,17,
        4,5,18,
        5,19,18,
        18,16,17,
        18,19,17,
        14,15,16,
        15,16,17,
        12,20,21,
        12,21,13,
        13,21,15,
        23,21,15,
        12,20,14,
        14,20,22,
        22,14,23,
        14,15,23,
        20,21,22,
        21,23,22
    ];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureCross() {
    let vertices = [
        0,-0.5,0,
        0.5,-0.5,0,
        0,-0.5,0.5,
        0.5,-0.5,0.5,
        0,0.5,0.5,
        0.5,0.5,0.5,
        0.5,0.5,0,
        0,0.5,0,
        0,0.5,-0.5,
        0.5,0.5,-0.5,
        0,1,-0.5,
        0.5,1,-0.5,
        0,1,0,
        0.5,1,0,
        0,1,0.5,
        0.5,1,0.5,
        0,1,1,
        0.5,1,1,
        0,0.5,1,
        0.5,0.5,1,
        0,1.5,0,
        0.5,1.5,0,
        0,1.5,0.5,
        0.5,1.5,0.5
    ];
    let indices = [
        0,1,2,
        1,2,3,
        0,7,1,
        7,6,1,
        2,4,3,
        4,5,3,
        1,6,3,
        6,5,3,
        0,7,4,
        4,2,0,
        6,8,7,
        6,8,9,
        8,9,10,
        10,9,11,
        9,11,13,
        9,6,13,
        8,10,12,
        8,7,12,
        10,12,11,
        12,11,13,
        6,13,15,
        6,5,15,
        7,12,14,
        7,4,14,
        4,14,16,
        4,18,16,
        5,19,17,
        5,15,17,
        4,5,18,
        5,19,18,
        18,16,17,
        18,19,17,
        14,15,16,
        15,16,17,
        12,20,21,
        12,21,13,
        13,21,15,
        23,21,15,
        12,20,14,
        14,20,22,
        22,14,23,
        14,15,23,
        20,21,22,
        21,23,22
    ];
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geometry,material);
    mesh.name = nameText;
    return mesh;
}

function configureCube() {
    let geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var mat = new THREE.MeshStandardMaterial({color: "red", wireframe: true});
    var mat = new THREE.MeshStandardMaterial({color: "red", wireframe: true, transparent: true});
    var mesh = new THREE.Mesh(geometry, mat);
    mesh.name = nameText;
    return mesh;
}

function configureWall() {
    let geometry = new THREE.BoxGeometry(0.2, 1, 3);
    var mat = new THREE.MeshStandardMaterial({color: "blue", wireframe: true, transparent: true});
    var mesh = new THREE.Mesh(geometry, mat);
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
    shapePropertiesMenu.add(shape.material, "wireframe").setValue(true).name("Wireframe");
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

function updateNameText(event) {
    nameText = event.target.value;
}

function updateShapeType(event) {
    shapeType = event.target.value;
}

function createShape() {
    if(nameIsRepeated()){ alert('Ese nombre ya está en uso'); return }
    let newShape;
    if(shapeType === 'pyramid') {
        newShape = configurePyramid();
    } 
    else if(shapeType === 'roof') {
        newShape = configureRoof();
    } 
    else if(shapeType === 'tetris') {
        newShape = configureTetris();
    }
    else if(shapeType === 'stairs') {
        newShape = configureStairs();
    }
    else if(shapeType === 'diamond') {
        newShape = configureDiamond();
    }
    else if(shapeType === 'table') {
        newShape = configureTable();
    }
    else if(shapeType === 'l') {
        newShape = configureL();
    }
    else if(shapeType === 'arrow') {
        newShape = configureArrow();
    }
    else if(shapeType === 'add') {
        newShape = configureAdd();
    }
    else if(shapeType === 'cross') {
        newShape = configureCross();
    }
    else if(shapeType === 'cube') {
        newShape = configureCube();
    }
    else {
        alert('Seleccione una figura');
        return;
    } 
    scene.add(newShape);
    addMenuFor(newShape, nameText);
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
    renderer.render(scene, camera);
    updateScene();
    stats.end();
    stats.update();
    requestAnimationFrame(renderLoop);
}
function updateScene() {
    runCollisionDetector();
    player.position.x += 0.01
}

function runCollisionDetector() {
    // collision detection:
    //   determines if any of the rays from the cube's origin to each vertex
    //		intersects any face of a mesh in the array of target meshes
    //   for increased collision accuracy, add more vertices to the cube;
    //		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
    //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    let originPoint = player.position.clone();
    const position = player.geometry.attributes.position;
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
            console.log('collision', collisionResults );
            if (collisionResults[0].object.name.includes("wall")) {
                // TRY AGAIN
                player.position.x = 0;
                player.position.z = 0;
            }
            if (collisionResults[0].object.name.includes("gem")) {
                // ADD POINTS
            }
        }
    }
}

function addWallToScene(x, z, name = "wall") {
    if (name === "wall") {
        name += collidableMeshList.length.toString();
    }
    let wall = configureWall();
    wall.position.x = x;
    wall.position.y = 0.5
    wall.position.z = z;
    wall.name = name;
    collidableMeshList.push(wall);
    scene.add(wall);
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
    collidableMeshList.push(gem);
    scene.add(gem);
}

//CONSTRUCTOR
function init() {
    setRenderer();
    configureScene();
    appendStats();
    addGrid();
    bind();
    gui = new dat.GUI(); 
    setBackgroundColorController();
    player = configureCube();
    console.log('player', player);
    scene.add(player);

    addWallToScene(3, 1.5);
    addWallToScene(-3, 0.5);
    addGemToScene(2,3);
    
    renderLoop();
}

// EVENT LISTENERS
document.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
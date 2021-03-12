import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import Stats from "https://unpkg.com/three@0.126.1/examples/jsm/libs/stats.module.js";
import dat from "https://unpkg.com/three@0.126.1/examples/jsm/libs/dat.gui.module.js";

//GLOBAL VARIABLES
let renderer, scene, camera, cameraControls, stats, gui;
let mainContainer = document.getElementById('main');
let shapes = []; //{name: string, shape: Mesh}

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
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
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
    scene.add(new THREE.AxesHelper(2));
}
function appendStats() {
    let statsContainer = document.getElementById('statsContainer');
    stats = new Stats();
    stats.showPanel(0); //FPS
    stats.domElement.style.cssText = '';
    statsContainer.appendChild(stats.dom);
}

//SHAPE CREATION BUILDERS
function configureCube() {
    let geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var mat = new THREE.MeshStandardMaterial({color: "red", wireframe: true});
    var mesh = new THREE.Mesh(geometry, mat);
    return mesh
}
function configureCone() {
    let geometry = new THREE.ConeGeometry( 0.5, 1, 8 );
    var mat = new THREE.MeshStandardMaterial({color: "blue", wireframe: true});
    var mesh = new THREE.Mesh(geometry, mat);
    return mesh
}
function configureSphere() {
    let geometry = new THREE.SphereGeometry( 1, 8, 8 );
    var mat = new THREE.MeshStandardMaterial({color: "yellow", wireframe: true});
    var mesh = new THREE.Mesh(geometry, mat);
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
    shapePropertiesMenu.addColor(shapeModel, "colorPalette").name("Color palette").listen().onChange((item) => {
        shape.material.color = new THREE.Color(color[0]/256, color[1]/256, color[2]/256);
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
console.log("update scene");
}

//CONSTRUCTOR
function init() {
    setRenderer();
    configureScene();
    appendStats();
    gui = new dat.GUI(); 
    renderLoop();
}

// EVENT LISTENERS
document.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
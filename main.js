import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import Stats from "https://unpkg.com/three@0.126.1/examples/jsm/libs/stats.module.js";
import dat from "https://unpkg.com/three@0.126.1/examples/jsm/libs/dat.gui.module.js";
let renderer, scene, camera, cameraControls, stats, gui;
let mainContainer = document.getElementById('main');
let folders = [];

function init() {
    // RENDERER ENGINE
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(new THREE.Color(0.2, 0.2, 0.35));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 100);
    camera.position.set(4, 1, 3);

    cameraControls = new OrbitControls(camera, renderer.domElement);

    var light = new THREE.DirectionalLight(0xffffff, 0.95);
    light.position.setScalar(1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    scene.add(new THREE.AxesHelper(2));
    let cube = configureCube();
    scene.add(cube);
    cube.position.z = 2

    let cone = configureCone();
    scene.add(cone)
    cone.position.x = 2

    let sphere = configureSphere();
    scene.add(sphere)

    //GUI
    gui = new dat.GUI(); 

    //MODEL
    let cubeModel = {
        rotY: cube.rotation.y * Math.PI / 180,
        rotX: cube.rotation.x * Math.PI / 180,
        rotZ: cube.rotation.z * Math.PI / 180,
        posHome: () => {
        cube.position.x = 0;
        cube.position.y = 0;
        cube.position.z = 2;
        },
        rotHome: () => {
        cubeModel.rotY = 0;
        cube.rotation.y = 0;
        cubeModel.rotX = 0;
        cube.rotation.x = 0;
        cubeModel.rotZ = 0;
        cube.rotation.z = 0;
        },
        colorList: ["White", "Red", "Yellow", 'Blue'],
        defaultColor: "White",
        colorPalette: [1, 1, 1]
    }
    
    //VIEW
    let cubePositionMenu = gui.addFolder("Cube Position");
    let cubeRotationMenu = gui.addFolder("Cube Rotation");
    let cubePropertiesMenu = gui.addFolder("Cube Properties");
    let sliderPosX = cubePositionMenu.add(cube.position, "x").min(-5).max(5).setValue(0).step(0.5).name("X").listen().onChange((value) => {
        console.log(value);
    });
    let sliderPosY = cubePositionMenu.add(cube.position, "y").min(-5).max(5).setValue(0).step(0.5).name("Y").listen().onChange((value) => {
        console.log(value);
    });
    let sliderPosZ = cubePositionMenu.add(cube.position, "z").min(-5).max(5).setValue(2).step(0.5).name("Z").listen().onChange((value) => {
        console.log(value);
    });
    let sliderRotX = cubeRotationMenu.add(cubeModel, "rotX").min(-180).step(10).max(180).setValue(0).name("X (deg)").listen().onChange((value) => {
        cube.rotation.x = cubeModel.rotX * Math.PI / 180;
    });
    let sliderRotY = cubeRotationMenu.add(cubeModel, "rotY").min(-180).step(10).max(180).setValue(0).name("Y (deg)").listen().onChange((value) => {
        cube.rotation.y = cubeModel.rotY * Math.PI / 180;
    });
    let sliderRotZ = cubeRotationMenu.add(cubeModel, "rotZ").min(-180).step(10).max(180).setValue(0).name("Z (deg)").listen().onChange((value) => {
        cube.rotation.z = cubeModel.rotZ * Math.PI / 180;
    });
    let btnPosHome = cubePositionMenu.add(cubeModel, 'posHome').name("Reset").onChange((event) => {

    });
    let btnRotHome = cubeRotationMenu.add(cubeModel, 'rotHome').name("Reset").onChange((event) => {
        
    });
    let checkboxWireframe = cubePropertiesMenu.add(cube.material, "wireframe").setValue(true).name("Wireframe").onChange((value) => {

    });

    let meshNameTextfield = cubePropertiesMenu.add(cube, "name").name("Model's name").onChange((event) => {

    }).onFinishChange((event) => {

    });
    let colorList = cubePropertiesMenu.add(cubeModel, "defaultColor", cubeModel.colorList).name("Color list").onChange((item) => {
        cube.material.color = new THREE.Color(cubeModel.defaultColor.toLowerCase());
        cubeModel.colorPalette = [cube.material.color.r, cube.material.color.g, cube.material.color.b]
    });
    let colorPalette = cubePropertiesMenu.addColor(cubeModel, "colorPalette").name("Color palette").listen().onChange((item) => {
        cube.material.color = new THREE.Color(color[0]/256, color[1]/256, color[2]/256);
    });

    



    // STATS
    let statsContainer = document.getElementById('statsContainer');
    stats = new Stats();
    stats.showPanel(0); //FPS
    stats.domElement.style.cssText = '';
    statsContainer.appendChild(stats.dom);

    // ANIMATION
    renderLoop();
}

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

function addMenuFor(shape) {

}

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

// EVENT LISTENERS
document.addEventListener("DOMContentLoaded", init);



window.addEventListener("resize", function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
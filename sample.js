// CAMERA 1 (PERSPECTIVE VIEW)
let fovy = 60.0;    // Field ov view
let aspectRatio = window.innerWidth / window.innerHeight;
let nearPlane = 0.1;
let farPlane = 10000.0;
camera1 = new THREE.PerspectiveCamera(fovy, aspectRatio, nearPlane, farPlane);
camera1.position.set(0, 0, camAway);
cameraControls = new OrbitControls(camera1, renderer.domElement);

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
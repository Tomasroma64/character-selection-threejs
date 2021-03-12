import * as THREE from 'https://threejs.org/build/three.module.js';

import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

let container;

let camera, scene, renderer;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let objectsDetails = [{
    name: "Lucas",
    slogan: "I'm trying my best"
}, {
    name: "another one by the same name",
    slogan: "the red light is on purpose "
}, {
    name: "another one by the same name",
    slogan: "the red light is on purpose "
}];

let objectsToLoad = ["Lucas.glb", "paulafix.gltf", "Laura.gltf", "Ning.gltf"]
let objects = [];
let currentSelection = 0;
let avatarSpacing = 3;

let finishedLoading = false;

init();
animate();


function init() {

    container = document.getElementById('canvas');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);


    // Handle input
    document.addEventListener('mousedown', onDocumentMouseDown, false);

    function onDocumentMouseDown(e) {
        if (finishedLoading) {
            if (e.clientX > (window.innerWidth / 2)) {
                changeSelected(1)
            } else {
                changeSelected(-1)
            }
        }
    }

    document.addEventListener("keydown", onDocumentKeyDown, false);

    function onDocumentKeyDown(event) {
        var keyCode = event.which;
        switch (keyCode) {
            case 37:
                changeSelected(-1);
                break;
            case 39:
                changeSelected(1)
                break;
        }
    }



    // scene

    scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 5);
    camera.add(pointLight);
    scene.add(camera);



    function ready() {

        changeSelected(0); // Must be 0, camera wont move. TODO: make this not a "thing"

        finishedLoading = true

        // Rotation
        let rotCount = 0
        window.setInterval(() => {
            objects.forEach(object => {
                object.rotation.set(0, rotCount, 0);
            });
            rotCount += 0.002;
        }, 1);


        window.setInterval(animateCamera, 20)

    }


    // Camera animation
    let animationOngoing = false;
    let animationDuration = 50;
    let animationCurrentFrame = 0;

    let cameraOffset;



    function changeSelected(direction) {

        if (!animationOngoing) {

            if (direction != 0) {
                animationOngoing = true;
                cameraOffset = new THREE.Vector3(camera.position.x + direction * avatarSpacing, 0, 0);
                animationCurrentFrame = 0;
            }

            currentSelection += direction

            document.getElementById("avatar-name").innerHTML = objectsDetails[currentSelection].name;
            document.getElementById("avatar-slogan").innerHTML = objectsDetails[currentSelection].slogan;

        }
    }

    function animateCamera() {
        if (animationOngoing) {
            camera.position.lerp(cameraOffset, animationCurrentFrame / animationDuration)
            animationCurrentFrame += 1;

            // TODO: Fix this limitation to the animation, last few frames have small change
            if (animationCurrentFrame > (animationDuration / 2)) {
                animationOngoing = false
                animationCurrentFrame = 0;
            }
        }
    }



    // LOADING MODELS
    const manager = new THREE.LoadingManager();


    // Importing
    manager.onProgress = function(item, loaded, total) {
        console.log(`Loading ${item}. Done: ${loaded}/${total}`);
        document.getElementById("loading-percent").innerHTML = `${((loaded / total)*100).toFixed(1)}%`

    };

    manager.onLoad = function() {
        console.log('Loading complete!');
        document.getElementById("loader-arrows").classList.add("hide");
        document.getElementById("loader-text").classList.add("hide");

        // Everything ready
        ready();
        loadModel();
    };

    manager.onError = function(url) {
        console.log('There was an error loading ' + url);
    };

    function onProgress(xhr) {
        if (xhr.lengthComputable) {
            console.log('model ' + Math.round(xhr.loaded / xhr.total * 100, 2) + '% downloaded');
        }
    }

    function onError() {}

    /*const loader = new OBJLoader(manager);
    loader.load('lucas.obj', function(obj) {
        objects.push(obj);

    }, onProgress, onError);*/

    const loader2 = new GLTFLoader(manager);
    objectsToLoad.forEach(object => {
        loader2.load(`${object}`, function(gltf) {
            gltf.scene.name = `${object}`
            objects.push(gltf.scene)

        }, onProgress, onError);
    });



    // Texturing
    const textureLoader = new THREE.TextureLoader(manager);
    const texture = textureLoader.load('lucas.jpg');


    var newMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });


    function loadModel() {

        /*objects.forEach(object => {
            console.log(object)
            object.traverse((o) => {
                if (o.isMesh) o.material = newMaterial;
            });
        });*/

        /*objects[2].traverse(function(child) {

            if (child.isMesh) child.material.map = texture;

        });
        objects[1].traverse(function(child) {

            if (child.isMesh) child.material.map = texture;

        });*/

        //objects[0].scale.set(0.3, 0.3, 0.3);
        let count = 0;
        objects.forEach(object => {
            object.position.x = count * avatarSpacing;
            scene.add(object)
            count++;
        });


        camera.lookAt(objects[currentSelection].position);

    }


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);


    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}



// Rendering

function animate() {
    requestAnimationFrame(animate);
    render();

}

function render() {
    //camera.position.x += (mouseX - camera.position.x) * .05;
    //camera.position.y += (-mouseY - camera.position.y) * .05;

    camera.position.y = 1;
    camera.position.z = 3;

    renderer.render(scene, camera);

}
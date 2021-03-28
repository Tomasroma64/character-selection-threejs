import * as THREE from 'https://threejs.org/build/three.module.js';

// Only GLTF, no OBJ
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

let container;

let camera, scene, renderer;

const modelsFolder = "models";
import models from "./models.js";

let objects = [];
let currentSelection = 0;
let avatarSpacing = 2;

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

            document.getElementById("avatar-name").innerHTML = models[currentSelection].name;
            document.getElementById("avatar-slogan").innerHTML = models[currentSelection].description;
            models[currentSelection].abilities.forEach(abilitie => {
                document.getElementById("abilities").innerHTML += `<p>${abilitie.name}</p>`
            });

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
        camera.lookAt(objects[currentSelection].position);
    };

    manager.onError = function(url) {
        console.log('There was an error loading ' + url);
    };

    function onProgress(xhr) {
        /*if (xhr.lengthComputable) {
            console.log('model ' + Math.round(xhr.loaded / xhr.total * 100, 2) + '% downloaded');
        }*/
    }

    function onError() {
        console.log("Loading error")
    }


    // LOAD
    objects = new Array(models.length)

    const loader2 = new GLTFLoader(manager);
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        loader2.load(`${modelsFolder}/${model.file}`, function(gltf) {
            gltf.scene.name = `${model.name}`

            // Cant use objects.push as they arrange models in "first downloaded" order => no for each loop
            objects[i] = gltf.scene

        }, onProgress, onError);
    }



    // Texturing

    function loadModel() {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            object.position.x = i * avatarSpacing;
            scene.add(object);
        }

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
    camera.position.y = 1;
    camera.position.z = 3;

    renderer.render(scene, camera);

}
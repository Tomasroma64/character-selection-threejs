import * as THREE from 'https://threejs.org/build/three.module.js';

import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';

let container;

let camera, scene, renderer;

let mouseX = 0,
    mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let objectsDetails = [{
    name: "Lucas",
    slogan: "I'm trying my best"
}, {
    name: "another one by the same name",
    slogan: "the red light is on purpose "
}];

let objects = [];
let currentSelection = 0;
let avatarSpacing = 10;

init();
animate();


function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);

    document.addEventListener('mousedown', onDocumentMouseDown, false);

    function onDocumentMouseDown(e) {
        if (e.clientX > (window.innerWidth / 2)) {
            changeSelected(1)
        } else {
            changeSelected(-1)
        }

    }


    // scene

    scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaaaaa, 0.8);
    camera.add(pointLight);
    scene.add(camera);

    // manager

    let rotCount = 0
    window.setInterval(function() {
        objects.forEach(object => {
            object.rotation.set(0, rotCount, 0);
        });
        rotCount += 0.01;

        animateCamera();
    }, 50);


    let animationOngoing = false;
    let animationDuration = 50;
    let animationCurrentFrame = 0;

    let cameraOffset;


    changeSelected(0)

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

            document.getElementById("text").innerHTML = animationCurrentFrame;

            //console.log(animationCurrentFrame)
            //console.log(animationCurrentFrame / animationDuration)

            // TODO: Fix this limitation to the animation, last few frames have small change
            if (animationCurrentFrame > (animationDuration / 2)) {
                animationOngoing = false
                animationCurrentFrame = 0;
            }
        }
    }



    function loadModel() {

        objects[0].traverse(function(child) {

            if (child.isMesh) child.material.map = texture;

        });
        objects[1].traverse(function(child) {

            if (child.isMesh) child.material.map = texture;

        });

        objects[0].position.x = 0;
        objects[1].position.x = 10;

        scene.add(objects[0]);
        scene.add(objects[1]);

        camera.lookAt(objects[currentSelection].position);

    }

    const manager = new THREE.LoadingManager(loadModel);

    manager.onProgress = function(item, loaded, total) {

        console.log(item, loaded, total);

    };





    // texture

    const textureLoader = new THREE.TextureLoader(manager);
    const texture = textureLoader.load('lucas.jpg');

    // model

    function onProgress(xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');
        }
    }

    function onError() {}

    const loader = new OBJLoader(manager);
    loader.load('lucas.obj', function(obj) {
        objects.push(obj);

    }, onProgress, onError);


    loader.load('lucas2.obj', function(obj) {
        objects.push(obj)

    }, onProgress, onError);

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove);

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;

}

//

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
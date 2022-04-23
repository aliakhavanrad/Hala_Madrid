import '../css/main.css'
import * as THREE from '../../node_modules/three'
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from '../../node_modules/three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from '../../node_modules/three/examples/jsm/geometries/TextGeometry.js'
import gsap from 'gsap'
import { Tween } from 'gsap/gsap-core'

// 1 - Move particles up in the sky (Maybe write sth, ex. "Hala Madrid")
// 2 - Change start position of camera to look up at the sky
// 3 - Pan camera to look at the first image
// 4 - With user interaction, move camera backward to see next year's image
// 5 - Create array of tweens for each move
// 6 - Add Start and Reset Button 
// 7 - Add event handlers for smart phones (touch end)
// 8 - Maybe listen to space button click to go forward

function main(){
    
    
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    
    const imagesCount = 21;    
    const imageWidth = 20;
    const yearTextWidth = 11;
    const x_amplitude = 100;
    const z_interval = 40;
    const images_z_offset = 500;
    const cameraToImage_z_distance = 30;
    const cameraFirstPosition = new THREE.Vector3(0, 0, 0);
    const cameraFirstRotation_x =  Math.PI / 2;

    let audio = null; 


    const animationsArray = [];
    let animationIndex = 0;

    /**
     * Scene
     */
     const scene = new THREE.Scene();
    

    /**
     * Renderer
     */
    
     const renderer = new THREE.WebGLRenderer({ antialias : true });
     renderer.setSize(sizes.width, sizes.height);
     renderer.setClearColor(0x222222);
     renderer.shadowMap.enabled = true;
     
    /**
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0;

    camera.position.set(cameraFirstPosition.x, 
                        cameraFirstPosition.y,
                        cameraFirstPosition.z);

    //camera.lookAt(0, 1000, 0)   
    camera.rotation.x = cameraFirstRotation_x

    /**
     * Axis Helper
     */

    // const axisHelper = new THREE.AxisHelper(200);
    // scene.add(axisHelper);


    /**
     * Canvas
     */

     const canvas = renderer.domElement;

     const sceneContainer = document.getElementById('scene-container');
     sceneContainer.appendChild(canvas);
 


    /**
     * Controls
     */

    // const controls = new OrbitControls(camera, canvas);
    // controls.enableRotate = true;
    // controls.enableDamping = true;
    // controls.maxPolarAngle = Math.PI / 2 - 0.01;

    /**
     * Light
     */

    const pointLight = new THREE.PointLight(0x444444, 5 );
    pointLight.position.set(0, 0 ,0 );    
    pointLight.castShadow = true;
    scene.add(pointLight);


    const directionalLight = new THREE.DirectionalLight(0x444444, 10);
    directionalLight.position.set(0, 1000 , 0);    
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    /**
     * Texture Loader
     */

     const textureLoader = new THREE.TextureLoader();    

     
    /**
     * Particles
     */

     const particlesCount = 1000;
     const particlesPositions = new Float32Array(particlesCount * 3);
 
     for(let i = 0; i < particlesCount; i++){
         
         particlesPositions[i * 3] = (Math.random() - 0.5) * 10000;
         particlesPositions[i * 3 + 1] = (Math.random()) * 10000 ;
         particlesPositions[i *3 + 2] = (Math.random() - 0.5) * 10000 ;
     }
 
 
     const particlesAttribute = new THREE.BufferAttribute(particlesPositions, 3);
 
     const particlesGeometry = new THREE.BufferGeometry();
     particlesGeometry.setAttribute('position', particlesAttribute);
 

     const particleTexture = textureLoader.load('static/images/RM_Logo1.png');
     const particlesMaterial = new THREE.PointsMaterial({map: particleTexture  });
     particlesMaterial.alphaTest = 0.001
     particlesMaterial.size = 100;
     
 
     const particles = new THREE.Points(particlesGeometry, particlesMaterial);
 
     particles.position.y = 1000;
     scene.add(particles);
 
 


    /**
     * Ground
     */
    const groundGeometry = new THREE.PlaneGeometry(2000, 4000);

    // const groundTexture = textureLoader.load('static/images/groundTexture1.jpg');
    const groundTexture = textureLoader.load('static/images/grassTexture.jpg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.magFilter = THREE.NearestFilter;
    groundTexture.repeat = new THREE.Vector2(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, map: groundTexture});
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.rotateX( - Math.PI / 2);

    // ground.castShadow = true;
    ground.receiveShadow = true;

    scene.add(ground);



    /**
     * Image
     */

    function createImage(loader, url, position){
            
        const planeGeometry = new THREE.BoxBufferGeometry(imageWidth, imageWidth, 1);

        const planeTexture = loader.load(url);

        const planeMaterial = new THREE.MeshStandardMaterial({ map: planeTexture});

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.position.set(position.x, position.y, position.z);
        plane.castShadow = true;

        return plane;
    }

    
    
    for(let i = 1; i <= imagesCount; i++){
        //const clonedImage =image.clone();

        const url = `static/images/_${1999 + i}.jpg`
        const image = createImage(textureLoader, url, new THREE.Vector3(0, imageWidth / 2, 0));
    

        const z = i / imagesCount ;

        image.position.x = Math.sin(z *  2 * Math.PI) * x_amplitude
        image.position.z = z * imagesCount * z_interval + images_z_offset
       

        /**
         * each Image animation
         */

        let timeline = gsap.timeline({ paused: true });

        if(i === 1){
            
            
            timeline.to(camera.rotation, 
                {
                    x:  -Math.PI / 20,  
                    ease : "slow.inOut", 
                    duration: 2 
                })

            animationsArray.push(timeline);            
        }
            
        timeline.to(pointLight.position, 
                    { 
                        x: image.position.x - 40,
                        y: 30, 
                        z: image.position.z + cameraToImage_z_distance,
                        ease : "sine.inOut",
                        duration: 2 
                    }, 0);
        timeline.to(camera.position,
                        {
                            x: image.position.x - yearTextWidth, 
                            y: 15, 
                            z : image.position.z + cameraToImage_z_distance, 
                            ease : "sine.inOut", 
                            duration: 2 
                        }, 0)
        timeline.to(image.rotation, {y: -Math.PI / 8, duration: 2 }, 0.5)

        animationsArray.push(timeline);


        /**
         * Back to the start animation
         */

        if(i === imagesCount){
            let lastTimeline = gsap.timeline({ paused: true }); //create the timeline
            lastTimeline.to(camera.position,
                            {
                                x: cameraFirstPosition.x, 
                                y: cameraFirstPosition.y, 
                                z : cameraFirstPosition.z, 
                                ease : "sine.inOut", duration: 2 
                            })

            lastTimeline.to(camera.rotation, 
                            {
                                x: cameraFirstRotation_x,
                                y: 0, 
                                z: 0,
                                duration: 2 
                            }, 1);

            animationsArray.push(lastTimeline);
        }

        scene.add(image); 
    }


    /**
     * Text Geometry
     */

     let startText;
    let guideText;
     const fontLoader = new FontLoader();

     fontLoader.load( 'static/fonts/gentilis_bold.typeface.json', function ( font ) {
     
        /**
         * Start Text
         */

         const startTextGeometry = new TextGeometry('Hala Madrid', {
            font: font,
            size: 100,
            height: 40,
            curveSegments: 2,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.2,
            bevelOffset: 0,
            bevelSegments: 3
        });

        startTextGeometry.center();

        const startTextMaterial = new THREE.MeshStandardMaterial({ color: 0xfaac00 });
    
        startText = new THREE.Mesh(startTextGeometry, startTextMaterial);

        startText.rotation.x = Math.PI / 2 - Math.PI / 16
        startText.position.y = 1000;

        scene.add(startText)


        /**
         * Guide Text
         */

         const guideTextGeometry = new TextGeometry('Click to start . . .', {
            font: font,
            size: 30,
            height: 10,
            curveSegments: 2,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.2,
            bevelOffset: 0,
            bevelSegments: 3
        });

        guideTextGeometry.center();

        const guideTextMaterial = new THREE.MeshStandardMaterial({ color: 0x0049a0 });
    
        guideText = new THREE.Mesh(guideTextGeometry, guideTextMaterial);

        guideText.rotation.x = Math.PI / 2 - Math.PI / 16
        guideText.position.x = 0;
        guideText.position.y = 800;
        guideText.position.z = -200;

        scene.add(guideText)





        /**
         * Years Images
         */

        for(let i = 1; i <= imagesCount; i++){
            
            const t = 1999 + i
            const textGeometry = new TextGeometry(t.toString(), {
                font: font,
                size: 4,
                height: 2,
                curveSegments: 2,
                bevelEnabled: true,
                bevelThickness: 0.2,
                bevelSize: 0.2,
                bevelOffset: 0,
                bevelSegments: 0
            });

            textGeometry.center();

            const textMaterial = new THREE.MeshStandardMaterial({ color: 0xfaac00 });
        
            const text = new THREE.Mesh(textGeometry, textMaterial);

            const z = i / imagesCount ;
    
            text.position.x = Math.sin(z *  2 * Math.PI) * x_amplitude - 20
            text.position.y = 2.5;
            text.position.z = z * imagesCount * z_interval + images_z_offset
           
            text.castShadow = true;

            scene.add(text)
        }

    });
    


     /**
      * Event Handlers
      */

     /**
      * Resize 
      */

     function onChangeDimension(){

        console.log(window);
        // Update Sizes
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;


        // Update Camera
        camera.aspect = sizes.width / sizes.height;
        //camera.aspect = 1.5;
        camera.updateProjectionMatrix();


        // Update renderer
        renderer.setSize(sizes.width, sizes.height);

     }

     window.addEventListener('resize', () => {
        onChangeDimension();
     })


     if (screen.orientation) { 
        screen.orientation.addEventListener("change", ()=>{
            onChangeDimension();
        });
    }


     /**
      * Click
      */

      sceneContainer.addEventListener('click', () => {

        if(!audio){ 
            audio  = new Audio('static/sounds/Hala Madrid.mp3');
            audio.onended = (event)=>{ audio.play() };
            audio.play();
        }

        var activeAnim = animationsArray.filter(x=>x.isActive());

        if(activeAnim.length > 0) return;


        if(animationIndex === 0){
            animationsArray[animationIndex++].play(0);
        }

        animationsArray[animationIndex++].play(0);
      
        if(animationIndex == imagesCount + 2){
            animationIndex = 0;
        }

        


     });



     const clock = new THREE.Clock();

    function tick() {

        const elapsedTime = clock.getElapsedTime();

        particles.rotation.y = Math.sin(elapsedTime / 50);

        if(startText){

            startText.rotation.y =  Math.PI / 6 * Math.cos(elapsedTime )
        }

        if(guideText){
            guideText.position.z = -200 + 10 * Math.sin(elapsedTime)

            // guideText.position.z = 200 * Math.cos(elapsedTime / 10)
        }

        requestAnimationFrame( tick );
    
        renderer.render( scene, camera );
    
    }

    tick();

}

main();


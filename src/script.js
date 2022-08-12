import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'


/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#b17271'
}

//          ▬▬▬▬▬▬▬▬▬ ✧✧ Textures ✧✧ ▬▬▬▬▬▬▬▬▬ 
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material1.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test cube
 */
const material1 = new THREE.MeshToonMaterial({ 
    color: parameters.materialColor,
    gradientMap: gradientTexture 
})


// Meshes
const objectDistance = 4
const mesh1 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(10, 3, 64, 28, 2, 3),
    material1,
    
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material1
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(10, 3, 64, 28, 2, 3),
    material1
)

scene.add(mesh1, mesh2, mesh3)
mesh1.scale.set(0.09,.09,.09)
mesh3.scale.set(0.03,.03,.03)

const sectionMeshes = [ mesh1, mesh2, mesh3 ]

// positioning
        // mesh1.position.y = - objectDistance * 0
mesh2.position.y = - objectDistance * 1
mesh3.position.y = - objectDistance * 2

mesh1.position.x = 1.5
mesh2.position.x = -2
mesh3.position.x = 2.5


//lights
const directionalLight = new THREE.DirectionalLight("#ffffff" , 1, )
scene.add(directionalLight)
directionalLight.position.set(1, 1, 0)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// camera group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)


// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ✧✧✧✧ SCROLLER ✧✧✧✧ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener("scroll", () => {
    
    scrollY = window.scrollY
    
    const newSection = Math.round(scrollY / sizes.height)

    if( newSection != currentSection){

        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: "+=3"
            }
        )
    }

})

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ✧✧ CURSOR 
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ✧✧ CURSOR 
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ✧✧ CURSOR 
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener("mousemove" , ( e ) => {
    cursor.x = e.clientX / sizes.width - 0.5 
    cursor.y = e.clientY / sizes.height - 0.5 

})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // animate camera
                    // height div object 
    camera.position.y = - scrollY / sizes.height * objectDistance

    const parallaxX = cursor.x
    const parallaxY = - cursor.y

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 2 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 2 * deltaTime

    // rotate meshes
    for(const mesh of sectionMeshes){

        mesh.rotation.x += deltaTime
        mesh.rotation.y += deltaTime
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
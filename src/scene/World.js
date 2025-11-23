import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Galaxy } from './Galaxy.js'
import { Starfield } from './Starfield.js'
import { Planet } from './Planet.js'

export class World {
    constructor(container) {
        this.container = container
        this.width = container.clientWidth
        this.height = container.clientHeight

        this.scene = new THREE.Scene()
        this.scene.fog = new THREE.FogExp2(0x050505, 0.002)

        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        this.camera.position.set(0, 10, 30)

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        container.appendChild(this.renderer.domElement)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05

        this.clock = new THREE.Clock()
        this.planets = []

        this.setupLights()
        this.initSpace()
        this.setupResize()
        this.setupResize()
        // this.setupGUI()
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
        this.scene.add(ambientLight)

        // Sun light at center
        const pointLight = new THREE.PointLight(0xffddaa, 2, 100)
        pointLight.position.set(0, 0, 0)
        this.scene.add(pointLight)

        // Sun mesh
        const sunGeometry = new THREE.SphereGeometry(2, 32, 32)
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa })
        const sun = new THREE.Mesh(sunGeometry, sunMaterial)
        this.scene.add(sun)

        // Sun glow
        const glowGeometry = new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load('https://assets.codepen.io/127738/glow.png'),
            color: 0xffaa00,
            transparent: true,
            blending: THREE.AdditiveBlending
        })
        const glow = new THREE.Sprite(glowGeometry)
        glow.scale.set(10, 10, 1)
        this.scene.add(glow)
    }

    initSpace() {
        this.galaxy = new Galaxy(this.scene)
        this.starfield = new Starfield(this.scene)

        // Solar System Planets (7 selected)
        // Mercury
        this.addPlanet(0.4, 6, 1.5, '#A5A5A5')
        // Venus
        this.addPlanet(0.9, 9, 1.2, '#E3BB76')
        // Earth
        this.addPlanet(1, 13, 1.0, '#22A6B3')
        // Mars
        this.addPlanet(0.5, 17, 0.8, '#DD4C3A')
        // Jupiter
        this.addPlanet(2.5, 25, 0.4, '#D9A066')
        // Saturn
        this.addPlanet(2, 32, 0.3, '#EAD6B8')
        // Uranus
        this.addPlanet(1.5, 38, 0.2, '#D1F7FF')

        // Galaxy Parameters
        const galaxyParams = {
            count: 5000,
            size: 0.1,
            radius: 30,
            branches: 4,
            spin: 1,
            randomness: 0.2,
            randomnessPower: 3,
            insideColor: '#ff6030',
            outsideColor: '#1b3984'
        }
        this.galaxy.generate(galaxyParams)
    }

    addPlanet(radius, orbitRadius, speed, color) {
        const planet = new Planet(this.scene, radius, orbitRadius, speed, color)
        this.planets.push(planet)
    }



    setupResize() {
        window.addEventListener('resize', () => {
            this.width = this.container.clientWidth
            this.height = this.container.clientHeight

            this.camera.aspect = this.width / this.height
            this.camera.updateProjectionMatrix()

            this.renderer.setSize(this.width, this.height)
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })
    }

    start() {
        this.renderer.setAnimationLoop(() => {
            this.update()
            this.render()
        })
    }

    update() {
        const elapsedTime = this.clock.getElapsedTime()
        this.controls.update()

        if (this.galaxy) this.galaxy.update(elapsedTime)
        if (this.starfield) this.starfield.update(elapsedTime)

        this.planets.forEach(planet => planet.update(elapsedTime))
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }
}

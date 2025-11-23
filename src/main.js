import './style.css'
import { World } from './scene/World.js'

// Initialize the 3D World
const container = document.getElementById('app')
const world = new World(container)

// Start the animation loop
world.start()

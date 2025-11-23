import * as THREE from 'three'

export class Starfield {
    constructor(scene, count = 5000) {
        this.scene = scene
        this.count = count
        this.geometry = null
        this.material = null
        this.points = null

        this.init()
    }

    init() {
        this.geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(this.count * 3)
        const sizes = new Float32Array(this.count)
        const shifts = new Float32Array(this.count)

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3

            // Random position in a large sphere
            const r = 100 + Math.random() * 800 // Distance from center
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)

            positions[i3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i3 + 2] = r * Math.cos(phi)

            sizes[i] = Math.random()
            shifts[i] = Math.random() * Math.PI
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
        this.geometry.setAttribute('aShift', new THREE.BufferAttribute(shifts, 1))

        this.material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float aSize;
        attribute float aShift;
        
        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectionPosition;
          
          // Twinkle size
          float twinkle = sin(uTime * 2.0 + aShift) * 0.5 + 0.5;
          gl_PointSize = aSize * 4.0 * uPixelRatio * (0.5 + twinkle * 0.5);
          gl_PointSize *= (1.0 / -viewPosition.z);
        }
      `,
            fragmentShader: `
        void main() {
          float strength = distance(gl_PointCoord, vec2(0.5));
          strength = 1.0 - strength;
          strength = pow(strength, 4.0);
          
          gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
        }
      `
        })

        this.points = new THREE.Points(this.geometry, this.material)
        this.scene.add(this.points)
    }

    update(elapsedTime) {
        if (this.material) {
            this.material.uniforms.uTime.value = elapsedTime
            // Slowly rotate the entire starfield
            this.points.rotation.y = elapsedTime * 0.02
        }
    }
}

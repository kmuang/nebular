import * as THREE from 'three'

export class Galaxy {
    constructor(scene) {
        this.scene = scene
        this.geometry = null
        this.material = null
        this.points = null
    }

    generate(params) {
        if (this.points !== null) {
            this.geometry.dispose()
            this.material.dispose()
            this.scene.remove(this.points)
        }

        this.geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(params.count * 3)
        const colors = new Float32Array(params.count * 3)
        const scales = new Float32Array(params.count * 1)
        const randomness = new Float32Array(params.count * 3)

        const colorInside = new THREE.Color(params.insideColor)
        const colorOutside = new THREE.Color(params.outsideColor)

        for (let i = 0; i < params.count; i++) {
            const i3 = i * 3

            // Position
            const radius = Math.random() * params.radius
            const spinAngle = radius * params.spin
            const branchAngle = (i % params.branches) / params.branches * Math.PI * 2

            const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius
            const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius
            const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius
            positions[i3 + 1] = 0
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius

            randomness[i3] = randomX
            randomness[i3 + 1] = randomY
            randomness[i3 + 2] = randomZ

            // Color
            const mixedColor = colorInside.clone()
            mixedColor.lerp(colorOutside, radius / params.radius)

            colors[i3] = mixedColor.r
            colors[i3 + 1] = mixedColor.g
            colors[i3 + 2] = mixedColor.b

            scales[i] = Math.random()
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
        this.geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))

        this.material = new THREE.ShaderMaterial({
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: params.size * window.devicePixelRatio }
            },
            vertexShader: `
        uniform float uTime;
        uniform float uSize;
        attribute float aScale;
        attribute vec3 aRandomness;
        varying vec3 vColor;

        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          
          // Rotate the galaxy
          float angle = atan(modelPosition.x, modelPosition.z);
          float distanceToCenter = length(modelPosition.xz);
          float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
          angle += angleOffset;
          
          modelPosition.x = cos(angle) * distanceToCenter;
          modelPosition.z = sin(angle) * distanceToCenter;

          // Add randomness after rotation to keep particles relative to arms
          modelPosition.xyz += aRandomness;

          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPosition = projectionMatrix * viewPosition;

          gl_Position = projectionPosition;
          gl_PointSize = uSize * aScale;
          gl_PointSize *= (1.0 / -viewPosition.z);

          vColor = color;
        }
      `,
            fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Light point
          float strength = distance(gl_PointCoord, vec2(0.5));
          strength = 1.0 - strength;
          strength = pow(strength, 10.0);

          vec3 color = vColor * strength;
          gl_FragColor = vec4(color, 1.0);
        }
      `
        })

        this.points = new THREE.Points(this.geometry, this.material)
        this.scene.add(this.points)
    }

    update(elapsedTime) {
        if (this.material) {
            this.material.uniforms.uTime.value = elapsedTime
        }
    }
}

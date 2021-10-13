import * as THREE from 'three'
import imagesLoaded from 'imagesloaded'
import FontFaceObserver from 'fontfaceobserver'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'
import ocean from '../img/ocean.jpg'

export default class Sketch {
  constructor(options) {
    this.time = 0
    this.container = options.dom
    this.scene = new THREE.Scene()

    this.scrollable = document.querySelector('main')
    this.current = 0
    this.tatget = 0
    this.ease = 0.075

    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
  	this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 100, 2000 );

    this.camera.fov = 2 * Math.atan((this.height / 2) / 400) * ( 180 / Math.PI );
  	this.camera.position.z = 400;

  	this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
  	this.renderer.setSize( window.innerWidth, window.innerHeight );
  	this.container.appendChild( this.renderer.domElement );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement )

    this.images = [...document.querySelectorAll('img')]

    const fontEbGaramond = new Promise(resolve => {
      new FontFaceObserver("eb garamond").load().then(() => {
        resolve()
      })
    })

    // preload images
    const preloadImages = new Promise((resolve, reject) => {
      imagesLoaded(document.querySelectorAll('img'), {
        background: true
      }, resolve)
    })

    let allDone = [fontEbGaramond, preloadImages]
    this.currentScroll = 0;

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    Promise.all(allDone).then(() => {
      this.addImages()
      this.setPosition()

      this.mouseMovement()
      this.resize()
      this.setupResize()
      this.addObjects()
      this.render()

      document.body.classList.add('allDone')
    })
  }

  mouseMovement() {
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = ( event.clientX / this.width ) * 2 - 1
      this.mouse.y = - ( event.clientY / this.height ) * 2 + 1

      this.raycaster.setFromCamera( this.mouse, this.camera )

      const intersects = this.raycaster.intersectObjects( this.scene.children )

      if (intersects.length > 0) {
        let obj = intersects[0].object
        obj.material.uniforms.hover.value = intersects[0].uv
      }
    }, false)
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t
  }

  smoothScroll() {
    this.target = window.scrollY;
    this.current = this.lerp(this.current, this.target, this.ease)
    this.scrollable.style.transform = `translate3d(0, ${-this.current}px, 0)`
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize( this.width, this.height )
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  addImages() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        uImage: { value: 0 },
        hover: { value: new THREE.Vector2(0.5, 0.5) },
        hoverState: { value: new THREE.Vector2(0.5, 0.5) },
        oceanTexture: { value: new THREE.TextureLoader().load(ocean) }
      },
      side: THREE.DoubleSide,
      fragmentShader: fragment,
      vertexShader: vertex,
    })

    this.materials = []

    this.imageStore = this.images.map(img => {
      let bounds = img.getBoundingClientRect()

      let geometry = new THREE.PlaneBufferGeometry(bounds.width, bounds.height, 100, 100);
      let texture = new THREE.Texture(img)
      texture.needsUpdate = true

      let material = this.material.clone()

      img.addEventListener('mouseenter', () => {
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 1
        })
      })

      img.addEventListener('mouseout', () => {
        gsap.to(material.uniforms.hoverState, {
          duration: 1,
          value: 0
        })
      })

      this.materials.push(material)

      material.uniforms.uImage.value = texture

      let mesh = new THREE.Mesh(geometry, material);

      this.scene.add(mesh)

      return {
        img: img,
        mesh: mesh,
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height
      }
    })
  }

  setPosition() {
    this.imageStore.forEach(o => {
      o.mesh.position.y = this.current - o.top + this.height / 2 - o.height / 2;
      o.mesh.position.x = o.left - this.width / 2 + o.width / 2
    })
  }

  addObjects() {
  	this.geometry = new THREE.PlaneBufferGeometry( 200, 200, 10, 10 );
  	// this.geometry = new THREE.SphereBufferGeometry( 1, 40, 40 );
  	this.material = new THREE.MeshNormalMaterial();

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        oceanTexture: { value: new THREE.TextureLoader().load(ocean) }
      },
      side: THREE.DoubleSide,
      fragmentShader: fragment,
      vertexShader: vertex,
      wireframe: true
    })

  	this.mesh = new THREE.Mesh( this.geometry, this.material );
  	// this.scene.add( this.mesh );
  }

  render() {
    this.time += 0.05

    // this.material.uniforms.time.value = this.time

  	this.renderer.render( this.scene, this.camera );
    this.smoothScroll();
    this.setPosition()

    this.materials.forEach(n => {
      n.uniforms.time.value = this.time
    })

    window.requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  dom: document.getElementById('container')
});

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 1;

	scene = new THREE.Scene();
}

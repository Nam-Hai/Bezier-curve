import { Geometry, Renderer, Camera, Transform, Vec2, Program, Mesh, Triangle } from 'ogl'
import { N } from './utils/namhai'
import BasicFrag from './shaders/BasicFrag.glsl?raw'
import BasicVer from './shaders/BasicVer.glsl?raw'
import PlaneBufferTarget from './PlaneBufferTarget'
import Media from './Media'
import Mouse from './Mouse'
import BezierCurve from './BezierCurve'

export default class Canvas {
  constructor() {
    this.renderer = new Renderer({
      alpha: true
    })
    this.gl = this.renderer.gl

    document.body.appendChild(this.gl.canvas)

    this.camera = new Camera(this.gl)
    this.camera.position.z = 5
    this.scene = new Transform()

    this.onResize()

    N.BM(this, ['update', 'onResize'])



    this.raf = new N.RafR(this.update)
    this.ro = new N.ROR(this.onResize)


    this.init()
    this.addEventListener()



    this.bezier = new BezierCurve(this.gl, new Vec2(0, 0), new Vec2(1, 1), new Vec2(0, 0.5), new Vec2(1, 0.5), { n: 50 })
    this.bezier.addToScene(this.scene)

  }
  init() {
    this.raf.run()
    this.ro.on()
  }
  addEventListener() {
    let ip1 = N.get('input#p1')
    let ip2 = N.get('input#p2')
    console.log(ip2, ip1);
    ip1.addEventListener('input', e => {
      this.bezier.update(new Vec2(0, ip1.value), new Vec2(1, ip2.value), 0.05)
    })
    ip2.addEventListener('input', e => {
      this.bezier.update(new Vec2(0, ip1.value), new Vec2(1, ip2.value), 0.05)
    })
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.sizePixel = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.camera.perspective({
      aspect: this.sizePixel.width / this.sizePixel.height
    })
    const fov = this.camera.fov * Math.PI / 180

    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    this.size = {
      height: height,
      width: height * this.camera.aspect
    }

  }

  update() {

    this.renderer.render({
      camera: this.camera,
      scene: this.scene
    })

  }


}

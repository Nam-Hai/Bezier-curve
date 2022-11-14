import { RenderTarget, Texture, Transform, Program, Plane, Mesh } from 'ogl'
import BasicFrag from './shaders/BasicFrag.glsl?raw'
import BasicVer from './shaders/BasicVer.glsl?raw'
import { N } from './utils/namhai'

export default class PlaneBufferTarget {

  constructor(gl, size) {

    this.gl = gl

    this.target = new RenderTarget(this.gl)
    let texture = new Texture(this.gl)

    this.sceneBuffer = new Transform()
    let program = new Program(this.gl, {
      fragment: BasicFrag,
      vertex: BasicVer,
      uniforms: {
        tMap: {
          value: texture
        }
      }
    })

    this.mesh = new Mesh(this.gl, {
      geometry: new Plane(this.gl),
      program,
    })


    this.mesh.setParent(this.sceneBuffer)
    this.mesh.scale.x = size.width
    this.mesh.scale.y = size.height
    this.mesh.position.x = 0
    this.mesh.position.y = 0

    N.BM(this, ['update', 'resize'])

    this.raf = new N.RafR(this.update)
    this.ro = new N.ROR(this.resize)
  }
  init() {
    this.raf.run()
    this.ro.on()
  }

  update() {
  }
  resize() {
  }
}

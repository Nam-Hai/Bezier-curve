import { Vec2 } from 'ogl'
import { N } from './utils/namhai'
import Clock from './Timer';


export default class Mouse {
  constructor() {
    this.oldMouse = new Vec2(0)
    this.mouse = new Vec2(0)
    this.velo = new Vec2(0)
    this.clock = new Clock()
    this.uVelo = new Vec2(0)

    N.BM(this, ['update', 'onMouseMove'])
    this.raf = new N.RafR(this.update)
  }
  init() {
    this.addEventListener()
    this.raf.run()
  }

  addEventListener() {
    document.addEventListener('mousemove', this.onMouseMove)
  }

  onMouseMove(e) {
    this.oldMouse.copy(this.mouse)
    // this.scroll.target += e.deltaY / 100
    const x = e.x / window.innerWidth
    const y = e.y / window.innerHeight



    this.mouse.set(x, y)
    this.mediaPos.set(N.Clamp(x, 0, 1), N.Clamp(y, 0, 1))

    let delta = this.clock.getDelta() || 14
    this.velo.x = N.Clamp(0.7 * (this.mouse.x - this.oldMouse.x) / delta, -1, 1)
    this.velo.y = N.Clamp(0.7 * (this.mouse.y - this.oldMouse.y) / delta, -1, 1)
    this.velo.needsUpdate = true

  }

  update() {
    if (!this.velo.needsUpdate) {
      this.mouse.set(-1)
      this.velo.set(0)
    }
    this.velo.needsUpdate = false

    this.uVelo.lerp(this.velo, 0.1)
  }

}

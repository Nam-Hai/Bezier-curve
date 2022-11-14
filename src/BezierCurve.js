import { Geometry, Renderer, Camera, Transform, Vec2, Program, Mesh, Triangle } from 'ogl'
import BasicFrag from './shaders/BasicFrag.glsl?raw'
import BasicVer from './shaders/BasicVer.glsl?raw'
function cubicBezier(t, p0, p1, p2, p3) {
  // prettier-ignore
  return (t * t * t * (p3 - 3 * p2 + 3 * p1 - p0) + t * t * (3 * p2 - 6 * p1 + 3 * p0) + t * (3 * p1 - 3 * p0) + p0)
}
function cubicBezierDeriv(t, p0, p1, p2, p3) {
  return (
    3 * t * t * (-p0 + 3 * p1 - 3 * p2 + p3) +
    2 * t * (3 * p0 - 6 * p1 + 3 * p2) +
    3 * (p1 - p0)
  )
}

export default class BezierCurve {
  constructor(gl, P1, P2, P1key, P2key,
    {
      n,
      largeur
    } = {}
  ) {
    this.gl = gl
    this.n = n || 20
    this.largeur = largeur || 0.05
    this.P1 = P1
    this.P1key = P1key

    this.P2 = P2
    this.P2key = P2key

    this.tiles = []

    this.computePoints()

    this.init()
  }

  computePoints() {

    this.points = []
    this.derivates = []
    this.normals = []
    for (let i = 0; i < this.n; i++) {
      let t = i / (this.n - 1)
      this.points.push(this.getPoint(t))
      let d = this.getDerivate(t)
      this.derivates.push(d)
      let normal = new Vec2(-d.y, d.x)
      normal.normalize()
      this.normals.push(normal)
    }
  }

  init() {
    for (let i = 0; i < this.n; i++) {
      if (i == (this.n - 1)) break
      let triangle = new Geometry(this.gl, {
        position: { size: 2, data: new Float32Array([this.points[i].x + this.normals[i].x, this.points[i].y + this.normals[i].y, this.points[i].x - this.normals[i].x, this.points[i].y - this.normals[i].y, this.points[i + 1].x + this.normals[i + 1].x, this.points[i + 1].y + this.normals[i + 1].y]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      })
      let triangle2 = new Geometry(this.gl, {
        position: {
          size: 2, data: new Float32Array([
            this.points[i].x - this.normals[i].x, this.points[i].y - this.normals[i].y,
            this.points[i + 1].x - this.normals[i + 1].x, this.points[i + 1].y - this.normals[i + 1].y,
            this.points[i + 1].x + this.normals[i + 1].x, this.points[i + 1].y + this.normals[i + 1].y])
        },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      })
      let mesh = new Mesh(this.gl, {
        geometry: triangle,
        program: new Program(this.gl, {
          fragment: BasicFrag,
          vertex: BasicVer,
          cullFace: null,
          uniforms: {
            color: {
              value: [0, 1, 0]
            }
          }
        })
      })
      let mesh2 = new Mesh(this.gl, {
        geometry: triangle2,
        program: new Program(this.gl, {
          fragment: BasicFrag,
          vertex: BasicVer,
          cullFace: null,
          uniforms: {
            color: {
              value: [1, 0, 0]
            }
          },
        })
      })

      this.tiles.push([mesh, mesh2])
    }

    for (let i = 0; i < this.n - 1; i++) {
      this.updateTile(i, 0.05)
    }
  }

  update(p1, p2, largeur) {
    p1 && (this.P1key = p1)
    p2 && (this.P2key = p2)
    largeur && (this.largeur = largeur)
    console.log(this.points[this.n - 2]);
    this.computePoints()
    console.log(this.points[this.n - 2]);

    for (let i = 0; i < this.n - 1; i++) {
      this.updateTile(i, this.largeur)
    }

  }

  updateTile(i, largeur) {
    let n = new Vec2().copy(this.normals[i])
    let n2 = new Vec2().copy(this.normals[i + 1])
    n.scale(largeur)
    n2.scale(largeur)
    let tile = this.tiles[i]
    tile[0].geometry.attributes.position.data = new Float32Array([
      this.points[i].x + n.x, this.points[i].y + n.y,
      this.points[i].x - n.x, this.points[i].y - n.y,
      this.points[i + 1].x + n2.x, this.points[i + 1].y + n2.y])
    tile[1].geometry.attributes.position.data = new Float32Array([
      this.points[i].x - n.x, this.points[i].y - n.y,
      this.points[i + 1].x - n2.x, this.points[i + 1].y - n2.y,
      this.points[i + 1].x + n2.x, this.points[i + 1].y + n2.y])

    tile[0].geometry.attributes.position.needsUpdate = true
    tile[1].geometry.attributes.position.needsUpdate = true
  }

  addToScene(scene) {
    for (const tile of this.tiles) {
      tile[0].setParent(scene)
      tile[1].setParent(scene)
    }
  }
  getPoint(t) {
    let r = new Vec2()
    r.x = cubicBezier(t, this.P1.x, this.P1key.x, this.P2key.x, this.P2.x)
    r.y = cubicBezier(t, this.P1.y, this.P1key.y, this.P2key.y, this.P2.y)
    return r
  }
  getDerivate(t) {
    let r = new Vec2()
    r.x = cubicBezierDeriv(t, this.P1.x, this.P1key.x, this.P2key.x, this.P2.x)
    r.y = cubicBezierDeriv(t, this.P1.y, this.P1key.y, this.P2key.y, this.P2.y)
    return r
  }
}

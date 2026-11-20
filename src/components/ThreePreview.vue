<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps<{ front?: string; back?: string }>()
const mount = ref<HTMLDivElement>()
let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls
let card: THREE.Mesh
let frame = 0
let autoRotate = true
let disconnectObserver: (() => void) | undefined
const loader = new THREE.TextureLoader()

function material(url: string | undefined, fallback: number) {
  const map = url ? loader.load(url, (texture) => { texture.colorSpace = THREE.SRGBColorSpace; renderer?.render(scene, camera) }) : undefined
  return new THREE.MeshStandardMaterial({ color: fallback, map, roughness: 0.82, metalness: 0.02 })
}

function updateMaterials() {
  if (!card) return
  const mats = card.material as THREE.MeshStandardMaterial[]
  mats[4]?.map?.dispose(); mats[5]?.map?.dispose()
  mats[4] = material(props.front, 0xffffff)
  mats[5] = material(props.back, 0x191919)
  card.material = mats
}

function face(which: 'front' | 'back') {
  autoRotate = false
  card.rotation.set(0.08, which === 'front' ? 0 : Math.PI, 0)
  controls.reset()
}
function toggleRotate() { autoRotate = !autoRotate }

onMounted(() => {
  if (!mount.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#efede7')
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0.35, 6.2)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  mount.value.appendChild(renderer.domElement)
  const geometry = new THREE.BoxGeometry(4.2, 2.4, 0.09, 2, 2, 1)
  const edge = new THREE.MeshStandardMaterial({ color: 0xe1ded5, roughness: 0.9 })
  card = new THREE.Mesh(geometry, [edge, edge, edge, edge, material(props.front, 0xffffff), material(props.back, 0x191919)])
  card.castShadow = true
  card.rotation.set(0.12, -0.35, -0.03)
  scene.add(card)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2.2))
  const key = new THREE.DirectionalLight(0xffffff, 3.4); key.position.set(3, 5, 5); key.castShadow = true; scene.add(key)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: 0x8c877e, opacity: 0.16 }))
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.8; floor.receiveShadow = true; scene.add(floor)
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 4.2; controls.maxDistance = 9
  const resize = () => {
    if (!mount.value || !renderer) return
    const { clientWidth: w, clientHeight: h } = mount.value
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
  }
  const observer = new ResizeObserver(resize); observer.observe(mount.value); resize()
  const animate = () => { frame = requestAnimationFrame(animate); if (autoRotate) card.rotation.y += 0.003; controls.update(); renderer?.render(scene, camera) }
  animate()
  disconnectObserver = () => observer.disconnect()
})

watch(() => [props.front, props.back], updateMaterials)
onBeforeUnmount(() => { cancelAnimationFrame(frame); disconnectObserver?.(); renderer?.dispose(); card?.geometry.dispose() })
defineExpose({ face, toggleRotate })
</script>

<template>
  <div class="preview-wrap">
    <div ref="mount" class="three-mount"></div>
    <div class="preview-controls">
      <button @click="face('front')">Front</button>
      <button @click="face('back')">Back</button>
      <button title="Toggle rotation" @click="toggleRotate">↻</button>
    </div>
    <span class="drag-hint">Drag to rotate · scroll to zoom</span>
  </div>
</template>

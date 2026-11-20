<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps<{ front?: string; back?: string; edgeColor?: string }>()
const mount = ref<HTMLDivElement>()
let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls
let card: THREE.Mesh
let frame = 0
let autoRotate = true
let disconnectObserver: (() => void) | undefined
let targetRotation: THREE.Euler | undefined
const selectedFace = ref<'front' | 'back' | null>(null)
const loader = new THREE.TextureLoader()

function material(url: string | undefined, fallback: number) {
  const map = url ? loader.load(url, () => renderer?.render(scene, camera)) : undefined
  if (map) {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() ?? 1, 8)
    map.minFilter = THREE.LinearMipmapLinearFilter
    map.magFilter = THREE.LinearFilter
  }
  return new THREE.MeshPhysicalMaterial({
    color: url ? 0xffffff : fallback,
    map,
    roughness: 0.68,
    metalness: 0,
    clearcoat: 0.08,
    clearcoatRoughness: 0.78,
  })
}

function edgeMaterial(colorHex?: string) {
  let color = 0x242220
  if (colorHex) {
    try {
      color = new THREE.Color(colorHex).getHex()
    } catch {
      color = 0x242220
    }
  }
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.7,
    metalness: 0.05,
    clearcoat: 0.05,
  })
}

function updateMaterials() {
  if (!card) return
  const mats = card.material as THREE.MeshPhysicalMaterial[]
  for (let i = 0; i < 4; i++) {
    mats[i]?.dispose()
    mats[i] = edgeMaterial(props.edgeColor)
  }
  mats[4]?.map?.dispose()
  mats[5]?.map?.dispose()
  mats[4]?.dispose()
  mats[5]?.dispose()
  mats[4] = material(props.front, 0xffffff)
  mats[5] = material(props.back, 0x191919)
  card.material = mats
}

function face(which: 'front' | 'back') {
  autoRotate = false
  selectedFace.value = which
  targetRotation = new THREE.Euler(0.07, which === 'front' ? -0.14 : Math.PI + 0.14, which === 'front' ? -0.018 : 0.018)
  controls.reset()
}
function toggleRotate() {
  autoRotate = !autoRotate
  targetRotation = undefined
  if (autoRotate) selectedFace.value = null
}

function lerpAngle(current: number, target: number, amount: number) {
  const delta = THREE.MathUtils.euclideanModulo(target - current + Math.PI, Math.PI * 2) - Math.PI
  return current + delta * amount
}

onMounted(() => {
  if (!mount.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#efede7')
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0.35, 6.2)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  mount.value.appendChild(renderer.domElement)
  const geometry = new THREE.BoxGeometry(4.2, 2.4, 0.024, 2, 2, 1)
  const edge = edgeMaterial(props.edgeColor)
  card = new THREE.Mesh(geometry, [edge, edge, edge, edge, material(props.front, 0xffffff), material(props.back, 0x191919)])
  card.castShadow = true
  card.rotation.set(0.12, -0.35, -0.03)
  scene.add(card)
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b2a8, 2.7))
  const key = new THREE.DirectionalLight(0xfff8ed, 3.1); key.position.set(4, 5.5, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 5; scene.add(key)
  const fill = new THREE.DirectionalLight(0xe8f0ff, 1.45); fill.position.set(-4, 1.5, 3); scene.add(fill)
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(0, 2, -4); scene.add(rim)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: 0x756f65, opacity: 0.13 }))
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.8; floor.receiveShadow = true; scene.add(floor)
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 4.2; controls.maxDistance = 9
  const resize = () => {
    if (!mount.value || !renderer) return
    const { clientWidth: w, clientHeight: h } = mount.value
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
    const scale = w <= 650 ? 0.9 : 0.7
    card.scale.setScalar(scale)
    floor.position.y = w <= 650 ? -1.55 : -1.28
  }
  const observer = new ResizeObserver(resize); observer.observe(mount.value); resize()
  const animate = () => {
    frame = requestAnimationFrame(animate)
    if (autoRotate) card.rotation.y += 0.003
    if (targetRotation) {
      card.rotation.x = THREE.MathUtils.lerp(card.rotation.x, targetRotation.x, 0.1)
      card.rotation.y = lerpAngle(card.rotation.y, targetRotation.y, 0.1)
      card.rotation.z = THREE.MathUtils.lerp(card.rotation.z, targetRotation.z, 0.1)
    }
    controls.update(); renderer?.render(scene, camera)
  }
  animate()
  disconnectObserver = () => observer.disconnect()
})

watch(() => [props.front, props.back, props.edgeColor], updateMaterials)
onBeforeUnmount(() => { cancelAnimationFrame(frame); disconnectObserver?.(); renderer?.dispose(); card?.geometry.dispose() })
defineExpose({ face, toggleRotate })
</script>

<template>
  <div class="preview-wrap">
    <div ref="mount" class="three-mount"></div>
    <div class="preview-controls">
      <button :class="{ active: selectedFace === 'front' }" @click="face('front')">Front</button>
      <button :class="{ active: selectedFace === 'back' }" @click="face('back')">Back</button>
      <button :class="{ active: autoRotate }" title="Toggle rotation" @click="toggleRotate">↻</button>
    </div>
    <span class="drag-hint">Drag to rotate · scroll to zoom</span>
  </div>
</template>

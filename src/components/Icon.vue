<template>
  <span v-if="iconSvg" v-html="iconSvg" :class="iconClass" :style="iconStyle" />
</template>

<script setup>
import { computed } from 'vue'
// Static imports for all icons
import home from '../assets/icons/home.svg?raw'
import user from '../assets/icons/user.svg?raw'
import login from '../assets/icons/login.svg?raw'
import signup from '../assets/icons/signup.svg?raw'
import document from '../assets/icons/document.svg?raw'
import edit from '../assets/icons/edit.svg?raw'
import editPencil from '../assets/icons/edit-pencil.svg?raw'
import binHalf from '../assets/icons/bin-half.svg?raw'
import garage from '../assets/icons/garage.svg?raw'
import close from '../assets/icons/close.svg?raw'
import databaseScriptPlus from '../assets/icons/database-script-plus (add log note).svg?raw'
import mediaImagePlus from '../assets/icons/media-image-plus (add image).svg?raw'
import mediaVideoPlus from '../assets/icons/media-video-plus (add video).svg?raw'
import pagePlus from '../assets/icons/page-plus (add document).svg?raw'
import brain from '../assets/icons/brain.svg?raw'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [String, Number], default: 24 },
  color: { type: String, default: '' }, // If empty, auto-contrast is used
  background: { type: String, default: '#fff' }, // Accepts any CSS color
  class: { type: String, default: '' }
})

const icons = {
  home,
  user,
  login,
  signup,
  document,
  edit,
  'edit-pencil': editPencil,
  delete: binHalf,
  garage,
  'database-script-plus (add log note)': databaseScriptPlus,
  'media-image-plus (add image)': mediaImagePlus,
  'media-video-plus (add video)': mediaVideoPlus,
  'page-plus (add document)': pagePlus,
  brain,
  close
}

function hexToRgb(hex) {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  return [num >> 16, (num >> 8) & 255, num & 255]
}

function getContrastYIQ(bg) {
  let r, g, b
  if (bg.startsWith('#')) {
    [r, g, b] = hexToRgb(bg)
  } else if (bg.startsWith('rgb')) {
    [r, g, b] = bg.match(/\d+/g).map(Number)
  } else {
    // fallback to white
    [r, g, b] = [255, 255, 255]
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? '#111' : '#fff'
}

const autoColor = computed(() =>
  props.color ? props.color : 'currentColor'
)

const iconSvg = computed(() => icons[props.name] || '')
const iconClass = computed(() => `icon ${props.class}`.trim())
const iconStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: autoColor.value,
  display: 'inline-block',
  verticalAlign: 'middle'
}))
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
</style> 
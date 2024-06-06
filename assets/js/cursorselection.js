let active = false
let x = 0
let y = 0
let startX = 0
let startY = 0
let zone = null
const setStartPosition = e => {
  startX = e.clientX
  startY = e.clientY
}
const trackMouse = e => {
  x = e.clientX
  y = e.clientY
  
  draw()
  highlight()
}
const draw = () => {
  if (!active) return
  if (zone) {
    const diffX = x - startX
    const diffY = y - startY
    const left = diffX >= 0 ? startX : x
    const top = diffY >= 0 ? startY : y
    const width = Math.abs(diffX)
    const height = Math.abs(diffY)
    zone.style.top = `${top}px`
    zone.style.left = `${left}px`
    zone.style.width = `${width}px`
    zone.style.height = `${height}px`
  }
  //timer = setTimeout(() => draw(), 16)
}
const createZone = () => {
  const zone = document.createElement('div')
  zone.classList.add('zone')
  zone.style.position = 'fixed'
  document
    .querySelector('body')
    .appendChild(zone)
  return zone
}
const destroyZone = () => {
  document
    .querySelector('body')
    .removeChild(zone)
  return null
}
const items = Array.from(document.querySelectorAll('.item'))
const highlight = () => {
  if (!active) return
  items.forEach(item => {
    const offset = item.getBoundingClientRect()
    const top = offset.top
    const left = offset.left
    const right = offset.left + offset.width
    const bottom = offset.top + offset.height
    //console.log(`startX: ${startX}, startY: ${startY}, x: ${x}, y: ${y}, top: ${top}, left: ${left}, right: ${right}, bottom: ${bottom}`)
    
    const toLeft = startX <= x
    const toBottom = startY <= y
    //console.log(toLeft, toBottom)
    
    let inZoneX = null
    let inZoneY = null
    
    if (toLeft) {
      inZoneX = left < x && right > startX
    } else {
      inZoneX = right > x && left < startX
    }
    
    if (toBottom) {
      inZoneY = top < y && bottom > startY
    } else {
      inZoneY = bottom > y && top < startY
    }
    const inZone = inZoneX && inZoneY
    const highlighted = item.classList.contains('highlighted')
    console.log(inZone, highlighted)
    if (inZone && !highlighted) {
      item.classList.add('highlighted')
    } else if (!inZone && highlighted) {
      item.classList.remove('highlighted')
    }
  })
  //timer = setTimeout(() => highlight(), 16)
}

document.addEventListener('mousedown', e => {
  if (e.button !== 0) return
  active = true
  setStartPosition(e)
  trackMouse(e)
  zone && destroyZone()
  zone = createZone()
  document.addEventListener('mousemove', trackMouse)
})

document.addEventListener('mouseup', e => {
  if (e.button !== 0) return
  trackMouse(e)
  active = false
  zone = destroyZone()
  document.removeEventListener('mousemove', trackMouse)
})
import ColorThief from 'colorthief'

// Cache for extracted colors to avoid re-processing
const colorCache = new Map()

/**
 * Simple color extraction fallback that doesn't rely on ColorThief
 * @param {ImageData} imageData - Canvas image data
 * @param {number} colorCount - Number of colors to extract
 * @returns {Array} Array of RGB color arrays
 */
function extractSimpleColors(imageData, colorCount = 5) {
  const colors = []
  const data = imageData.data
  const step = Math.floor(data.length / (colorCount * 4))
  
  for (let i = 0; i < colorCount; i++) {
    const index = i * step
    const r = data[index]
    const g = data[index + 1]
    const b = data[index + 2]
    colors.push([r, g, b])
  }
  
  return colors
}

/**
 * Extract dominant colors from an image
 * @param {string} imageUrl - URL of the image
 * @param {number} colorCount - Number of colors to extract (default: 5)
 * @returns {Promise<Array>} Array of RGB color arrays
 */
export async function extractColorsFromImage(imageUrl, colorCount = 5) {
  // Check cache first
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)
  }

  // Check if the image URL is valid
  if (!imageUrl || imageUrl === '') {
    return getFallbackColors()
  }

  // For Supabase storage URLs, we might need different handling
  const isSupabaseUrl = imageUrl.includes('supabase.co') || imageUrl.includes('storage.googleapis.com')

  try {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // Try with CORS first
      img.crossOrigin = 'anonymous'
      
      // Set up timeout
      const timeout = setTimeout(() => {
        console.warn('Image loading timeout, using fallback colors')
        resolve(getFallbackColors())
      }, 5000) // 5 second timeout
      
      img.onload = () => {
        clearTimeout(timeout)
        try {
          // Ensure image is fully loaded and has dimensions
          if (img.width === 0 || img.height === 0) {
            console.warn('Image has no dimensions, using fallback colors')
            resolve(getFallbackColors())
            return
          }

          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Set canvas dimensions to match image
          canvas.width = img.naturalWidth || img.width
          canvas.height = img.naturalHeight || img.height
          
          // Draw the image to canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          
          let palette
          try {
            // Try ColorThief first
            const colorThief = new ColorThief()
            palette = colorThief.getPalette(imageData, colorCount)
          } catch (colorThiefError) {
            console.warn('ColorThief failed, using simple color extraction:', colorThiefError)
            palette = extractSimpleColors(imageData, colorCount)
          }
          
          // Cache the result
          colorCache.set(imageUrl, palette)
          resolve(palette)
        } catch (error) {
          console.error('Error extracting colors from canvas:', error)
          resolve(getFallbackColors())
        }
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        console.warn('Failed to load image for color extraction, using fallback colors')
        resolve(getFallbackColors())
      }
      
      // Set src after setting up event handlers
      img.src = imageUrl
    })
  } catch (error) {
    console.error('Error in extractColorsFromImage:', error)
    // Return fallback colors if extraction fails
    return getFallbackColors()
  }
}

/**
 * Generate a gradient from an array of colors
 * @param {Array} colors - Array of color values
 * @returns {string} CSS gradient string
 */
export function generateGradientFromColors(colors) {
  if (!colors || colors.length === 0) {
    return getFallbackGradient()
  }

  // Use the first two colors for a subtle gradient
  const color1 = colors[0] || '#d1d5db'
  const color2 = colors[1] || '#e5e7eb'
  
  return `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`
}

/**
 * Generate a gradient with reduced opacity for better text readability
 * @param {Array} colors - Array of RGB color arrays
 * @param {string} direction - Gradient direction (default: '135deg')
 * @returns {string} CSS gradient string
 */
export function generateSubtleGradientFromColors(colors, direction = '135deg') {
  if (!colors || colors.length === 0) {
    return getFallbackGradient()
  }

  // Convert RGB arrays to CSS color strings with lower opacity
  const colorStops = colors.map((color, index) => {
    const [r, g, b] = color
    const percentage = (index / (colors.length - 1)) * 100
    return `rgba(${r}, ${g}, ${b}, 0.3) ${percentage}%`
  })

  return `linear-gradient(${direction}, ${colorStops.join(', ')})`
}

/**
 * Get fallback colors when image extraction fails
 * @returns {Array} Array of fallback RGB colors
 */
function getFallbackColors() {
  return [
    [107, 114, 128], // Gray-500
    [156, 163, 175], // Gray-400
    [75, 85, 99],    // Gray-600
    [209, 213, 219], // Gray-300
    [55, 65, 81]     // Gray-700
  ]
}

/**
 * Get fallback gradient when no colors are available
 * @returns {string} CSS gradient string
 */
function getFallbackGradient() {
  return 'radial-gradient(circle, #d1d5db 0%, #e5e7eb 100%)'
}

/**
 * Calculate the relative luminance of a color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {number} Relative luminance value
 */
function calculateLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Determine the best text color (black or white) for optimal contrast
 * @param {Array} colors - Array of RGB color arrays
 * @returns {string} CSS color string ('black' or 'white')
 */
export function getContrastTextColor(colors) {
  if (!colors || colors.length === 0) {
    return 'white' // Default to white for fallback
  }

  // Calculate average luminance of all colors
  let totalLuminance = 0
  let validColors = 0

  for (const color of colors) {
    if (color && color.length >= 3) {
      const [r, g, b] = color
      totalLuminance += calculateLuminance(r, g, b)
      validColors++
    }
  }

  if (validColors === 0) {
    return 'white'
  }

  const averageLuminance = totalLuminance / validColors
  
  // Use a more conservative threshold for better contrast
  // Lower threshold means more likely to use white text
  return averageLuminance > 0.4 ? 'black' : 'white'
}

/**
 * Extract colors and generate gradient for a project
 * @param {Object} project - Project object with image_url
 * @param {boolean} subtle - Whether to use subtle gradient (default: false)
 * @returns {Promise<string>} CSS gradient string
 */
export async function getProjectGradient(project, subtle = false) {
  if (!project || !project.image_url) {
    return getFallbackGradient()
  }

  try {
    const colors = await extractColorsFromImage(project.image_url, 3)
    return subtle 
      ? generateSubtleGradientFromColors(colors)
      : generateGradientFromColors(colors)
  } catch (error) {
    console.error('Error generating project gradient:', error)
    return getFallbackGradient()
  }
}

/**
 * Extract colors and get contrast text color for a project
 * @param {Object} project - Project object with image_url
 * @returns {Promise<Object>} Object with gradient and text color
 */
export async function getProjectGradientAndTextColor(project, subtle = false) {
  if (!project || !project.image_url) {
    return {
      gradient: getFallbackGradient(),
      textColor: 'white'
    }
  }

  try {
    const colors = await extractColorsFromImage(project.image_url, 3)
    const gradient = subtle 
      ? generateSubtleGradientFromColors(colors)
      : generateGradientFromColors(colors)
    const textColor = getContrastTextColor(colors)
    
    return { gradient, textColor }
  } catch (error) {
    console.error('Error generating project gradient and text color:', error)
    return {
      gradient: getFallbackGradient(),
      textColor: 'white'
    }
  }
}

/**
 * Get a random neutral gradient
 * @returns {string} CSS gradient string
 */
export function getRandomGradient() {
  const neutralGradients = [
    'radial-gradient(circle, #d1d5db 0%, #e5e7eb 100%)',
    'radial-gradient(circle, #e5e7eb 0%, #f3f4f6 100%)',
    'radial-gradient(circle, #d1d5db 0%, #f3f4f6 100%)',
    'radial-gradient(circle, #9ca3af 0%, #d1d5db 100%)',
    'radial-gradient(circle, #e5e7eb 0%, #f9fafb 100%)',
    'radial-gradient(circle, #d1d5db 0%, #f9fafb 100%)',
    'radial-gradient(circle, #9ca3af 0%, #e5e7eb 100%)',
    'radial-gradient(circle, #f3f4f6 0%, #ffffff 100%)'
  ]
  
  return neutralGradients[Math.floor(Math.random() * neutralGradients.length)]
}

/**
 * Clear the color cache
 */
export function clearColorCache() {
  colorCache.clear()
} 
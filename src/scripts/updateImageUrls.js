import { supabase } from '../supabaseClient'

async function updateImageUrls() {
  try {
    // 1. Get all images from the database
    const { data: images, error: fetchError } = await supabase
      .from('images')
      .select('*')

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${images.length} images to update`)

    // 2. Update each image URL
    for (const image of images) {
      try {
        // Extract the filename from the old URL
        const oldUrl = image.image_url
        const filename = oldUrl.split('/').pop()

        // Create new URL in the images bucket
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filename)

        // Update the database record
        const { error: updateError } = await supabase
          .from('images')
          .update({ image_url: publicUrl })
          .eq('id', image.id)

        if (updateError) {
          console.error(`Error updating image ${image.id}:`, updateError)
          continue
        }

        console.log(`Successfully updated URL for image ${image.id}`)
      } catch (imageError) {
        console.error(`Error processing image ${image.id}:`, imageError)
      }
    }

    console.log('URL updates completed!')
  } catch (error) {
    console.error('URL update failed:', error)
  }
}

// Run the update
updateImageUrls() 
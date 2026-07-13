import { env } from '../config/env.js'

export const uploadProfileImage = async (file) => {
  if (!file) {
    return ''
  }

  if (!env.imgbbApiKey) {
    throw new Error('Image upload is not configured yet.')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file for the profile picture.')
  }

  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${env.imgbbApiKey}`, {
    method: 'POST',
    body: formData,
  })
  const result = await response.json()

  if (!response.ok || !result?.data?.url) {
    throw new Error(result?.error?.message || 'Profile image upload failed.')
  }

  return result.data.url
}

export const uploadCampaignImage = async (file) => {
  if (!file) {
    return ''
  }

  if (!env.imgbbApiKey) {
    throw new Error('Image upload is not configured yet.')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file for the campaign cover.')
  }

  if (file.size > 4 * 1024 * 1024) {
    throw new Error('Campaign cover must be 4MB or smaller.')
  }

  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${env.imgbbApiKey}`, {
    method: 'POST',
    body: formData,
  })
  const result = await response.json()

  if (!response.ok || !result?.data?.url) {
    throw new Error(result?.error?.message || 'Campaign image upload failed.')
  }

  return result.data.url
}

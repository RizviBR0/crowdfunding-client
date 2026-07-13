import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { apiClient } from '../lib/api.js'
import { getFirebaseAuth } from '../lib/firebase.js'
import { registerWithEmail } from './authService.js'
import { uploadProfileImage } from './imageUpload.js'

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('../lib/firebase.js', () => ({
  getFirebaseAuth: vi.fn(),
  getGoogleProvider: vi.fn(),
}))

vi.mock('../lib/api.js', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('./imageUpload.js', () => ({
  uploadProfileImage: vi.fn(),
  uploadCampaignImage: vi.fn(),
}))

describe('email registration handoff', () => {
  afterEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it('creates an account without sending an empty photo URL and refreshes the Firebase token', async () => {
    const firebaseUser = { getIdToken: vi.fn().mockResolvedValue('firebase-id-token') }
    getFirebaseAuth.mockReturnValue({})
    createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser })
    apiClient.post.mockResolvedValue({
      data: {
        data: {
          accessToken: 'server-access-token',
          user: { email: 'asha@example.com', role: 'supporter', credits: 50 },
        },
      },
    })

    const user = await registerWithEmail({
      name: 'Asha Bloom',
      email: 'asha@example.com',
      password: 'Strong1',
      role: 'supporter',
    })

    expect(updateProfile).toHaveBeenCalledWith(firebaseUser, { displayName: 'Asha Bloom' })
    expect(firebaseUser.getIdToken).toHaveBeenCalledWith(true)
    expect(apiClient.post).toHaveBeenCalledWith('/auth/session', {
      firebaseIdToken: 'firebase-id-token',
      intendedRole: 'supporter',
    })
    expect(user).toMatchObject({ role: 'supporter', credits: 50 })
  })

  it('includes an uploaded profile URL when the optional image succeeds', async () => {
    const firebaseUser = { getIdToken: vi.fn().mockResolvedValue('firebase-id-token') }
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    getFirebaseAuth.mockReturnValue({})
    uploadProfileImage.mockResolvedValue('https://i.ibb.co/avatar.png')
    createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser })
    apiClient.post.mockResolvedValue({ data: { data: { accessToken: 'token', user: {} } } })

    await registerWithEmail({
      name: 'Mina Maker',
      email: 'mina@example.com',
      password: 'Strong1',
      role: 'creator',
      photoFile: file,
    })

    expect(updateProfile).toHaveBeenCalledWith(firebaseUser, {
      displayName: 'Mina Maker',
      photoURL: 'https://i.ibb.co/avatar.png',
    })
  })
})

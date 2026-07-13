import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { apiClient } from '../lib/api.js'
import { getFirebaseAuth, getGoogleProvider } from '../lib/firebase.js'
import { clearAccessToken, saveAccessToken } from '../lib/tokenStorage.js'
import { uploadProfileImage } from './imageUpload.js'

export const restoreSession = async () => {
  const response = await apiClient.get('/auth/me')

  return response.data.data.user
}

export const exchangeSession = async ({ firebaseUser, intendedRole, forceRefresh = false }) => {
  const firebaseIdToken = await firebaseUser.getIdToken(forceRefresh)
  const response = await apiClient.post('/auth/session', {
    firebaseIdToken,
    intendedRole,
  })

  saveAccessToken(response.data.data.accessToken)
  return response.data.data.user
}

export const registerWithEmail = async ({ name, email, password, role, photoFile, photoUrl }) => {
  const uploadedPhotoUrl = photoFile ? await uploadProfileImage(photoFile) : ''
  const finalPhotoUrl = uploadedPhotoUrl || photoUrl || ''
  const auth = getFirebaseAuth()
  const credential = await createUserWithEmailAndPassword(auth, email, password)

  const profile = {
    displayName: name,
  }

  if (finalPhotoUrl) {
    profile.photoURL = finalPhotoUrl
  }

  await updateProfile(credential.user, profile)

  return exchangeSession({ firebaseUser: credential.user, intendedRole: role, forceRefresh: true })
}

export const loginWithEmail = async ({ email, password }) => {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)

  return exchangeSession({ firebaseUser: credential.user })
}

export const loginWithGoogle = async ({ role }) => {
  const credential = await signInWithPopup(getFirebaseAuth(), getGoogleProvider())

  return exchangeSession({ firebaseUser: credential.user, intendedRole: role })
}

export const logout = async () => {
  clearAccessToken()
  await signOut(getFirebaseAuth())
}

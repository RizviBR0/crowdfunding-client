import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { env } from '../config/env.js'

let app

const getFirebaseApp = () => {
  if (!app) {
    app = initializeApp(env.firebase)
  }

  return app
}

export const getFirebaseAuth = () => getAuth(getFirebaseApp())

export const getGoogleProvider = () => new GoogleAuthProvider()

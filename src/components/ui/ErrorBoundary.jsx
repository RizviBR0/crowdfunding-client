import { Component } from 'react'
import Button from './Button.jsx'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return <main className="route-placeholder" aria-live="assertive"><p className="route-placeholder__eyebrow">Something went wrong</p><h1>We couldn’t load this view.</h1><p>Refresh the page to try again. Your account and saved server data are unchanged.</p><Button onClick={() => window.location.reload()}>Refresh page</Button></main>
  }
}

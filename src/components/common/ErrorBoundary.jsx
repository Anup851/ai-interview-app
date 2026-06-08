import React from 'react'
import Button from '../ui/Button.jsx'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('App error boundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-white p-6 text-center dark:bg-zinc-950">
        <div className="max-w-md">
          <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">Refresh the page and try again. The app is designed to fail closed instead of exposing a broken screen.</p>
          <Button className="mt-6" onClick={() => window.location.reload()}>Reload app</Button>
        </div>
      </div>
    )
  }
}


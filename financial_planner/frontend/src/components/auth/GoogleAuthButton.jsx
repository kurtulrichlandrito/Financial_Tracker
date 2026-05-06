import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { apiPost } from "../../utils/api"

const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID

let googleScriptPromise

const loadGoogleScript = () => {
    if (window.google?.accounts?.id) {
        return Promise.resolve()
    }

    if (googleScriptPromise) {
        return googleScriptPromise
    }

    googleScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')

        if (existingScript) {
            existingScript.addEventListener('load', resolve, { once: true })
            existingScript.addEventListener('error', reject, { once: true })
            return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
    })

    return googleScriptPromise
}

function GoogleAuthButton({ setMessage, setIsSubmitting, text = 'continue_with' }) {
    const buttonRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        let isActive = true

        loadGoogleScript()
            .then(() => {
                if (!isActive || !buttonRef.current || !window.google?.accounts?.id) {
                    return
                }

                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: async ({ credential }) => {
                        if (!credential) {
                            setMessage('Google sign-in was cancelled.')
                            return
                        }

                        setIsSubmitting(true)
                        setMessage('')

                        try {
                            const response = await apiPost('/api/google-login/', { credential })
                            const data = await response.json()

                            if (!response.ok) {
                                setMessage(data.Message || 'Unable to sign in with Google')
                                return
                            }

                            navigate('/dashboard')
                        } catch {
                            setMessage('Unable to sign in with Google. Please try again.')
                        } finally {
                            setIsSubmitting(false)
                        }
                    }
                })

                buttonRef.current.replaceChildren()
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: 'outline',
                    size: 'large',
                    shape: 'rectangular',
                    text,
                    width: 320,
                })
            })
            .catch(() => {
                if (isActive) {
                    setMessage('Unable to load Google sign-in. Please refresh and try again.')
                }
            })

        return () => {
            isActive = false
        }
    }, [navigate, setIsSubmitting, setMessage, text])

    return (
        <>
            <div className="auth-divider">
                <span>or</span>
            </div>
            <div className="google-auth-button" ref={buttonRef} />
        </>
    )
}

export default GoogleAuthButton

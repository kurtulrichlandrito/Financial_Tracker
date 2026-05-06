import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import apiPost from "../../utils/api"
import GoogleAuthButton from "./GoogleAuthButton"

function Login() {
    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    })
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target

        setCredentials((current) => ({
            ...current,
            [name]: value
        }))
        setMessage('')
    }

    const handleLogin = (event) => {
        event.preventDefault()
        setIsSubmitting(true)

        apiPost('/api/login/', credentials)
            .then((response) => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                if (ok) {
                    navigate('/dashboard')
                    return
                }

                setMessage(data.Message || 'Unable to log in')
            })
            .catch(() => setMessage('Unable to log in. Please try again.'))
            .finally(() => setIsSubmitting(false))
    }

    return (
        <div className="auth-page">
            <div className="page-card auth-card">
                <p className="eyebrow">Finance Planner</p>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to continue tracking your money.</p>

                <form className="form-stack" onSubmit={handleLogin}>
                    <div>
                        <label>Email or username</label>
                        <input type="text" name="username" value={credentials.username} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" name="password" value={credentials.password} onChange={handleChange} required />
                    </div>

                    {message && <p className="form-message">{message}</p>}

                    <button type="submit" className="button-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <GoogleAuthButton
                    setMessage={setMessage}
                    setIsSubmitting={setIsSubmitting}
                    text="continue_with"
                />

                <p className="auth-footer">
                    Don&apos;t have an account? <Link className="link" to="/register">Create one</Link>
                </p>
            </div>
        </div>
    )
}

export default Login

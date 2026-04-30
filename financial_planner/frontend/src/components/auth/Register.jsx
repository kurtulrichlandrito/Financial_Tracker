import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import apiPost from "../../utils/api"

const initialForm = {
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
}

function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState(initialForm)
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target

        setForm((current) => ({
            ...current,
            [name]: value
        }))
        setMessage('')
    }

    const handleRegister = (event) => {
        event.preventDefault()

        if (form.password !== form.confirmPassword) {
            setMessage('Passwords do not match')
            return
        }

        setIsSubmitting(true)
        const { confirmPassword, ...signupData } = form

        apiPost('/api/signup/', signupData)
            .then((response) => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    const firstError = Object.values(data)?.[0]?.[0]
                    setMessage(data.Message || firstError || 'Unable to create account')
                    return null
                }

                return apiPost('/api/login/', {
                    username: form.username,
                    password: form.password
                })
            })
            .then((loginResponse) => {
                if (!loginResponse) return null
                if (loginResponse.ok) {
                    navigate('/dashboard')
                    return null
                }

                return loginResponse.json()
            })
            .then((loginData) => {
                if (loginData?.Message) setMessage(loginData.Message)
            })
            .catch(() => setMessage('Unable to create account. Please try again.'))
            .finally(() => setIsSubmitting(false))
    }

    return (
        <div className="auth-page">
            <div className="page-card auth-card auth-card-wide">
                <p className="eyebrow">Finance Planner</p>
                <h1 className="auth-title">Create account</h1>
                <p className="auth-subtitle">Start with a secure account, then build your financial picture.</p>

                <form className="form-stack" onSubmit={handleRegister}>
                    <div className="form-grid">
                        <div>
                            <label>First name</label>
                            <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>Last name</label>
                            <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required />
                        </div>
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Username</label>
                        <input type="text" name="username" value={form.username} onChange={handleChange} required />
                    </div>
                    <div className="form-grid">
                        <div>
                            <label>Password</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>Confirm password</label>
                            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
                        </div>
                    </div>

                    {message && <p className="form-message">{message}</p>}

                    <button type="submit" className="button-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Register'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link className="link" to="/login">Login</Link>
                </p>
            </div>
        </div>
    )
}

export default Register

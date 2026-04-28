import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom";
import '../global.css'
import '../forms.css'

function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const handleLogin = () => {
        event.preventDefault()
        const RequestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }
        fetch('/api/login/', RequestOptions)
            .then((response) => {

                if (response.ok) {
                    navigate('/dashboard')
                }
                return response.json()
            })
            .then((data) => setMessage(data.Message))
    }
    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h1>Plan your Nonexistent Money</h1>
                <form onSubmit={handleLogin} onChange={() => setMessage('')}>
                    <div className="field">
                        <p>Username</p>
                        <input type="text" onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="field">
                        <p>Password</p>
                        <input type="password" onChange={(e) => setPassword(e.target.value)} required /></div>

                    {message && <p className="msg msg-error"> {message}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Login</button>
                    <p className="auth-footer">Don't have an account? <Link to="/register">Signup</Link></p>
                </form>
            </div>

        </div>
    )

}

export default Login
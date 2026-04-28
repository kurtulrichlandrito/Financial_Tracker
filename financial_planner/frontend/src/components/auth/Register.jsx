import { useState } from "react";
import { Link } from "react-router-dom";
import apiPost from "../../utils/api";
import { useNavigate } from "react-router-dom";
import '../global.css'
import '../forms.css'
function Register() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [first_name, setFirstName] = useState('')
    const [last_name, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    return (
        <div className="auth-page">
            <div className="card auth-card" style={{ maxWidth: 460 }}>
                <h1>Create Account</h1>
                <form onSubmit={handleRegister} onChange={() => setMessage('')}>
                    <div>
                        <div className="field">
                            <p>First Name</p>
                            <input type="text" onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                        <div className="field">
                            <p>Last Name</p>
                            <input type="text" onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                        <div className="field">
                            <p>Email</p>
                            <input type="email" onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="field">
                            <p>Username</p>
                            <input type="text" onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="field">
                            <p>Password</p>
                            <input type="password" onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>
                    <button onClick={handleRegister}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            justifyContent: 'center'
                        }}
                    >Register</button>

                    {message && <p className="msg msg-error">{message}</p>}
                    <p className="auth-footer">Have an account? <Link to="/login">Login</Link></p>
                </form>
            </div>

        </div>
    )
    function handleRegister() {
        event.preventDefault()
        apiPost('/api/signup/', { first_name, last_name, email, username, password })
            .then((response) => {

                if (response.ok) {
                    navigate('/dashboard')
                }
                return response.json()
            })
            .then((data) => {
                if (data.Message) {
                    setMessage(data.Message)
                } else {
                    setMessage(Object.values(data)[0][0])
                }
            })
    }
}


export default Register
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const handleLogin = () => {
        const RequestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }
        fetch('/api/login', RequestOptions)
            .then((response) => {
                if (response.ok) {
                    navigate('/dashboard')
                }

            })
    }
    return (
        <div>
            <h1>Plan your Nonexistent Money</h1>
            <p>Username</p>
            <form action=""></form>
            <input type="text" onChange={(e) => setUsername(e.target.value)} />
            <p>Password</p>
            <input type="password" onChange={(e) => setPassword(e.target.value)} />
            <br />
            <button onClick={handleLogin} >Login</button>
            <p>Don't have an account? <Link to="/register">Signup</Link></p>
        </div>
    )

}





export default Login
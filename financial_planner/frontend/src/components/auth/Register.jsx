import { useState } from "react";
import { Link } from "react-router-dom";
import apiPost from "../../utils/api";
import { useNavigate } from "react-router-dom";
function Register() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [first_name, setFirstName] = useState('')
    const [last_name, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    return (
        <div>
            <form onSubmit={handleRegister} onChange={() => setMessage('')}>
                <h1>Register for an Account</h1>
                <h2>Personal Information</h2>
                <p>First Name</p>
                <input type="text" onChange={(e) => setFirstName(e.target.value)} required />
                <p>Last Name</p>
                <input type="text" onChange={(e) => setLastName(e.target.value)} required />
                <p>Email</p>
                <input type="email" onChange={(e) => setEmail(e.target.value)} required />
                <p>Username</p>
                <input type="text" onChange={(e) => setUsername(e.target.value)} required />
                <p>Password</p>
                <input type="password" onChange={(e) => setPassword(e.target.value)} required />
                <br />
                <button onClick={handleRegister} >Register</button>
                {message && <p>{message}</p>}
                <p>Have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    )
    function handleRegister() {
        event.preventDefault()
        apiPost('/api/signup', { first_name, last_name, email, username, password })
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
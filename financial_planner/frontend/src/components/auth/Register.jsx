import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [first_name, setFirstName] = useState('')
    const [last_name, setLastName] = useState('')
    const [email, setEmail] = useState('')

    return (
        <div>
            <h1>Register for an Account</h1>
            <h2>Personal Information</h2>
            <p>First Name</p>
            <input type="text" onChange={(e) => setFirstName(e.target.value)} />
            <p>Last Name</p>
            <input type="text" onChange={(e) => setLastName(e.target.value)} />
            <p>Email</p>
            <input type="email" onChange={(e) => setEmail(e.target.value)} />
            <p>Username</p>
            <input type="text" onChange={(e) => setUsername(e.target.value)} />
            <p>Password</p>
            <input type="password" onChange={(e) => setPassword(e.target.value)} />
            <br />
            <button onClick={handleRegister} >Register</button>
            <p>Have an account? <Link to="/login">Login</Link></p>
        </div>
    )
    function handleRegister() {
        const RequestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: first_name,
                last_name: last_name,
                email: email,
                username: username,
                password: password
            })
        }
        fetch('/api/register', RequestOptions)
            .then((response) => response.json())
            .then((data) => console.log(data))
    }
}





export default Register
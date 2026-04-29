import { useState } from "react"
import apiPost from '../../utils/api'
import '../categories.css'

function CreateAccount() {
    const [account_type, setAccountType] = useState('')
    const [balance, setBalance] = useState('')
    const [account_nickname, setAccountNickname] = useState('')
    const [message, setMessage] = useState('')

    const handleAddButton = () => {
        apiPost('/api/account/', { account_type, balance, account_nickname })
            .then((response) => response.json())
            .then((data) => setMessage(data.Message))
            .catch()
    }
    return (
        <div className="account-page">
            <h1>Add An Account</h1>
            <div className="field">
                <p>Account Type</p>
                <select onChange={(e) => { setAccountType(e.target.value); setMessage('') }} defaultValue={''} >
                    <option value="" disabled hidden>Please choose...</option>
                    <option value="chequing">Chequing</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit</option>
                </select>
            </div>

            <div className="field">
                <p>Account Name</p>
                <input type="text" onChange={(e) => {
                    setAccountNickname(e.target.value)
                    setMessage('')
                }} />
            </div>
            <div className="field">
                <p>Account Number</p>
                <input type="text" placeholder="To be implemented" />
            </div>
            <div className="field">
                <p>Current Balance</p>
                <input type="number" onChange={(e) => {
                    setBalance(e.target.value)
                    setMessage('')
                }} />
            </div>


            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAddButton}>Add</button>
            {message && <p>{message}: {account_nickname} - {account_type}- {balance}</p>}
        </div>
    )
}


export default CreateAccount
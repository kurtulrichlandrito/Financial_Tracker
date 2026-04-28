import { useState } from "react"
import apiPost from '../../utils/api'

function CreateLiability() {
    const [liability_name, setLiabilityName] = useState('')
    const [liability_amount, setLiabilityAmount] = useState('')
    const [message, setMessage] = useState('')

    const handleAddButton = () => {
        apiPost('/api/liability/', { liability_name, liability_amount })
            .then((response) => response.json())
            .then((data) => setMessage(data.Message))
            .catch()
    }
    return (
        <div className="liability-page">
            <h1>Add A Liability</h1>
            <p>Liability Name</p>
            <input type="text" onChange={(e) => {
                setLiabilityName(e.target.value)
                setMessage('')
            }} />
            <p>Liability Amount</p>
            <input type="text" onChange={(e) => {
                setLiabilityAmount(e.target.value)
                setMessage('')
            }} />

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAddButton}>Add</button>
            {message && <p>{message}: {liability_name} - {liability_amount}</p>}
        </div>
    )
}


export default CreateLiability
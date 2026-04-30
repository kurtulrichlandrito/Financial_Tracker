import { useState } from "react"
import apiPost from '../../utils/api'
import currencyFormatter from "../../utils/currencyFormatter"

function CreateLiability({ onRefresh, onClose }) {
    const [liability_name, setLiabilityName] = useState('')
    const [liability_amount, setLiabilityAmount] = useState('')
    const [message, setMessage] = useState('')

    const handleAddButton = () => {
        apiPost('/api/liability/', { liability_name, liability_amount })
            .then((response) => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                setMessage(data.Message)

                if (ok) {
                    onRefresh?.()
                    onClose?.()
                }
            })
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
            {message && <p>{message}: {liability_name} - {currencyFormatter.format(liability_amount || 0)}</p>}
        </div>
    )
}


export default CreateLiability

import { useState } from "react"
import apiPost from '../../utils/api'

function CreateAsset({ onRefresh, onClose }) {
    const [asset_name, setAssetName] = useState('')
    const [asset_amount, setAssetAmount] = useState('')
    const [message, setMessage] = useState('')

    const handleAddButton = () => {
        apiPost('/api/asset/', { asset_name, asset_amount })
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
        <div className="asset-page">
            <h1>Add An Asset</h1>
            <p>Asset Name</p>
            <input type="text" onChange={(e) => {
                setAssetName(e.target.value)
                setMessage('')
            }} />

            <p>Asset Amount</p>
            <input type="text" onChange={(e) => {
                setAssetAmount(e.target.value)
                setMessage('')
            }} />

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAddButton}>Add</button>
            {message && <p>{message}: {asset_name} - {asset_amount}</p>}
        </div>
    )
}


export default CreateAsset

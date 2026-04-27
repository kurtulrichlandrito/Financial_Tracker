import { useState } from "react"
import apiPost from '../../utils/api'

function CreateAsset() {
    const [asset_name, setAssetName] = useState('')
    const [asset_amount, setAssetAmount] = useState('')
    const [message, setMessage] = useState('')

    const handleAddButton = () => {
        apiPost('/api/asset/', { asset_name, asset_amount })
            .then((response) => response.json())
            .then((data) => setMessage(data.Message))
            .catch()
    }
    return (
        <div>
            <h1>Add An Asset</h1>
            <input type="text" onChange={(e) => {
                setAssetName(e.target.value)
                setMessage('')
            }} />
            <p>Asset Name</p>
            <input type="text" onChange={(e) => {
                setAssetAmount(e.target.value)
                setMessage('')
            }} />
            <p>Asset Amount</p>
            <button onClick={handleAddButton}>Add</button>
            {message && <p>{message}: {asset_name} - {asset_amount}</p>}
        </div>
    )
}


export default CreateAsset
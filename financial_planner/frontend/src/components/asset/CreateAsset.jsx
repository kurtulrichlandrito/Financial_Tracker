import { useState } from "react"
import apiPost from '../../utils/api'

const initialAsset = {
    asset_name: '',
    asset_amount: ''
}

function CreateAsset({ onRefresh, onClose }) {
    const [asset, setAsset] = useState(initialAsset)
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target

        setAsset((current) => ({
            ...current,
            [name]: value
        }))
        setMessage('')
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (!asset.asset_name.trim() || !asset.asset_amount) {
            setMessage('Asset name and amount are required')
            return
        }

        setIsSubmitting(true)

        apiPost('/api/asset/', asset)
            .then((response) => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                setMessage(data.Message || 'Unable to save asset')

                if (ok) {
                    setAsset(initialAsset)
                    onRefresh?.()
                    onClose?.()
                }
            })
            .catch(() => setMessage('Unable to save asset. Please try again.'))
            .finally(() => setIsSubmitting(false))
    }

    return (
        <div className="asset-page">
            <h1>Add An Asset</h1>

            <form onSubmit={handleSubmit}>
                <p>Asset Name</p>
                <input
                    type="text"
                    name="asset_name"
                    value={asset.asset_name}
                    onChange={handleChange}
                />

                <p>Asset Amount</p>
                <input
                    type="number"
                    name="asset_amount"
                    min="0"
                    step="0.01"
                    value={asset.asset_amount}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    className="btn btn-primary w-full justify-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding...' : 'Add'}
                </button>
            </form>

            {message && <p>{message}: {asset.asset_name} - {asset.asset_amount}</p>}
        </div>
    )
}

export default CreateAsset

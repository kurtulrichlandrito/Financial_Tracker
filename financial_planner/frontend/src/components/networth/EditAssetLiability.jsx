import { useEffect, useState } from "react"
import { apiDelete, apiPatch } from '../../utils/api'

const itemConfig = {
    asset: {
        endpoint: '/api/asset/',
        label: 'Asset',
        nameField: 'asset_name',
        amountField: 'asset_amount',
        updatedMessage: 'Asset updated'
    },
    liability: {
        endpoint: '/api/liability/',
        label: 'Liability',
        nameField: 'liability_name',
        amountField: 'liability_amount',
        updatedMessage: 'Liability updated'
    }
}

function EditAssetLiability({ type, target, onRefresh, onClose }) {
    const config = itemConfig[type]
    const [itemDetails, setItemDetails] = useState(target || {})
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setItemDetails(target || {})
        setMessage('')
    }, [target])

    if (!config) return null

    const handleChange = (event) => {
        const { name, value } = event.target

        setItemDetails((current) => ({
            ...current,
            [name]: value
        }))
        setMessage('')
    }

    const handleUpdateButton = (event) => {
        event.preventDefault()
        setIsSubmitting(true)

        apiPatch(`${config.endpoint}?id=${target?.id}`, itemDetails)
            .then((response) => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                setMessage(data.Message || `Unable to update ${config.label.toLowerCase()}`)

                if (ok) {
                    onRefresh?.()
                    onClose?.()
                }
            })
            .catch(() => setMessage(`Unable to update ${config.label.toLowerCase()}. Please try again.`))
            .finally(() => setIsSubmitting(false))
    }

    const handleDeleteButton = (event) => {
        event.preventDefault()
        setIsSubmitting(true)

        apiDelete(config.endpoint, { items: [target?.id] })
            .then((response) => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                setMessage(data.Message || `Unable to delete ${config.label.toLowerCase()}`)

                if (ok) {
                    onRefresh?.()
                    onClose?.()
                }
            })
            .catch(() => setMessage(`Unable to delete ${config.label.toLowerCase()}. Please try again.`))
            .finally(() => setIsSubmitting(false))
    }

    return (
        <div className={`${type}-page`}>
            <h1>Edit {config.label}</h1>

            <form onSubmit={handleUpdateButton}>
                <p>{config.label} Name</p>
                <input
                    type="text"
                    name={config.nameField}
                    value={itemDetails[config.nameField] || ''}
                    onChange={handleChange}
                    required />

                <p>{config.label} Amount</p>
                <input
                    type="number"
                    name={config.amountField}
                    min="0"
                    step="0.01"
                    value={itemDetails[config.amountField] || ''}
                    onChange={handleChange}
                    required />

                <button
                    type="submit"
                    className="button-primary full-width"
                    disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Update'}
                </button>
                <button
                    type="button"
                    className="button-danger full-width"
                    disabled={isSubmitting}
                    onClick={handleDeleteButton}>
                    Delete
                </button>
            </form>

            {message && <p>{message}</p>}
        </div>
    )
}

export default EditAssetLiability

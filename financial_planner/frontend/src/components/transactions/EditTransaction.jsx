import { useState, useEffect } from "react"
import { apiDelete, apiPatch } from '../../utils/api'


function EditTransaction({ type, target, onRefresh, onClose }) {
    const [message, setMessage] = useState('')
    const [transaction_categories, setTransactionCategories] = useState([])
    const [accounts, setAccounts] = useState([])
    const [transactionDetails, setTransactionDetails] = useState(target || {})

    const handleUpdateButton = (event) => {
        event.preventDefault()

        apiPatch(`/api/transactions/?id=${target?.id}`, transactionDetails)
            .then((response) => response.json())
            .then((data) => {
                setMessage(data.Message)

                if (data.Message === 'Transaction updated') {
                    onRefresh?.()
                    onClose?.()
                }
            })
    }

    const handleDeleteButton = (event) => {
        event.preventDefault()

        apiDelete(`/api/transactions/?type=${type}`, { items: [target?.id] })
            .then((response) => response.json())
            .then((data) => {
                setMessage(data.Message)
                onRefresh?.()
                onClose?.()
            })
    }

    useEffect(() => {
        getCategories()
        getAccounts()
    }, [])

    useEffect(() => {
        setTransactionDetails(target || {})
    }, [target])

    const getAccounts = () => {
        fetch('/api/account', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => setAccounts(data))
    }

    const getCategories = () => {
        fetch(`/api/categories/?type=${type}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => setTransactionCategories(data))
    }
    return (
        <div className="asset-page">
            <h1>Edit {type}</h1>

            <form >
                <p>Transaction Date</p>
                <input type="date"
                    min="1999-12-31"
                    max="2099-12-31"
                    value={transactionDetails.transaction_date || ''}
                    onChange={(e) => {
                        setTransactionDetails((details) =>
                            ({ ...details, transaction_date: e.target.value }))
                        setMessage('')
                    }} required />

                <p>{type} Amount</p>
                <input type="number" onChange={(e) => {
                    setTransactionDetails((details) => ({ ...details, transaction_amount: e.target.value }))
                    setMessage('')
                }} required
                    value={transactionDetails.transaction_amount || ''} />

                <p>Category</p>
                <select onChange={(e) =>
                    setTransactionDetails((details) => ({ ...details, transaction_category: e.target.value }))}
                    value={transactionDetails.transaction_category || ''}
                    required>
                    <option value="" disabled hidden>Please choose...</option>
                    {transaction_categories.map((category) => (

                        <option
                            key={category.id}
                            value={category.id}>
                            {category.transaction_category}
                        </option>
                    ))}
                </select>

                <p>Account</p>
                <select className="field" onChange={(e) => {
                    setTransactionDetails((details) => ({ ...details, account_id: e.target.value }))
                    setMessage('');
                }}
                    value={transactionDetails.account_id || ''}
                    required>
                    <option value="" disabled hidden>Please choose...</option>
                    {accounts.map((account) => (
                        <option key={account.id}
                            value={account.id}>
                            {account.account_nickname} ({account.account_type})
                        </option>
                    ))}
                </select>

                <p>{type} Notes</p>
                <input type="text" onChange={(e) => {
                    setTransactionDetails((details) => ({ ...details, transaction_notes: e.target.value }))
                    setMessage('')
                }}
                    value={transactionDetails.transaction_notes || ''}
                    required />
                <button type='submit' className="btn btn-primary w-full justify-center" onClick={handleUpdateButton}>Update</button>
                <button type='button' className="btn w-full justify-center" onClick={handleDeleteButton}>Delete</button>
            </form>

            {message && <p>{message}: {transactionDetails.transaction_date} -
                {type} - {transactionDetails.transaction_amount}  </p>}
        </div>
    )
}


export default EditTransaction

import { useState, useEffect } from "react"
import apiPost from '../../utils/api'
import getDatePresetISO from '../../utils/dateHelper'
import currencyFormatter from "../../utils/currencyFormatter"

function CreateTransaction({ type, globalRefresh, onRefresh }) {
    const [asset_name, setAssetName] = useState('')
    const [asset_amount, setAssetAmount] = useState('')
    const [message, setMessage] = useState('')
    const [transaction_categories, setTransactionCategories] = useState([])
    const [accounts, setAccounts] = useState([])
    const [transactionDetails, setTransactionDetails] = useState({ transaction_type: type })

    const handleAddButton = (event) => {
        event.preventDefault()

        apiPost('/api/transactions/', transactionDetails)
            .then((response) => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                setMessage(data.Message)

                if (ok) {
                    onRefresh?.()
                }
            })
    }

    useEffect(() => {
        getCategories()
        getAccounts()
    }, [])

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
            <h1>Add an {type}</h1>

            <form >
                <p>Transaction Date</p>
                <input type="date"
                    min="1999-12-31"
                    max="2099-12-31"
                    onChange={(e) => {
                        setTransactionDetails((details) =>
                            ({ ...details, transaction_date: e.target.value }))
                        setMessage('')
                    }} required />

                <p>{type} Amount</p>
                <input type="number" onChange={(e) => {
                    setTransactionDetails((details) => ({ ...details, transaction_amount: e.target.value }))
                    setMessage('')
                }} required />

                <p>Category</p>
                <select onChange={(e) =>
                    setTransactionDetails((details) => ({ ...details, transaction_category: e.target.value }))}
                    defaultValue=""
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
                    defaultValue={""}
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
                }} required />
                <button type='submit' className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAddButton}>Add</button>
            </form>

            {message && <p>{message}: {transactionDetails.transaction_date} -
                {type} - {currencyFormatter.format(transactionDetails.transaction_amount || 0)}  </p>}
        </div>
    )
}


export default CreateTransaction

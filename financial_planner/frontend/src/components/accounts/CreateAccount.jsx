import { useEffect, useState } from "react"
import apiPost, { apiDelete, apiPatch } from '../../utils/api'
import '../categories.css'
import currencyFormatter from "../../utils/currencyFormatter"

function CreateAccount({ target = null, onRefresh, onClose }) {
    const isUpdate = Boolean(target?.id)
    const [account_type, setAccountType] = useState(target?.account_type || '')
    const [balance, setBalance] = useState(target?.balance || '')
    const [account_nickname, setAccountNickname] = useState(target?.account_nickname || '')
    const [message, setMessage] = useState('')

    useEffect(() => {
        setAccountType(target?.account_type || '')
        setBalance(target?.balance || '')
        setAccountNickname(target?.account_nickname || '')
        setMessage('')
    }, [target])

    const handleAddButton = () => {
        const accountDetails = { account_type, balance, account_nickname }
        const request = isUpdate
            ? apiPatch(`/api/account/?id=${target.id}`, accountDetails)
            : apiPost('/api/account/', accountDetails)

        request
            .then((response) => response.json()
                .then((data) => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                setMessage(data.Message)

                if (ok) {
                    onRefresh?.()
                    if (isUpdate) onClose?.()
                }
            })
            .catch()
    }

    const handleDeleteButton = () => {
        apiDelete('/api/account/', { items: [target?.id] })
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
        <div className="account-page">
            <h1>{isUpdate ? 'Update Account' : 'Add An Account'}</h1>
            <div className="field">
                <p>Account Type</p>
                <select onChange={(e) => { setAccountType(e.target.value); setMessage('') }} value={account_type} >
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
                }} value={account_nickname} />
            </div>
            <div className="field">
                <p>Current Balance</p>
                <input type="number" onChange={(e) => {
                    setBalance(e.target.value)
                    setMessage('')
                }} value={balance} />
            </div>


            <button className="button-primary full-width" onClick={handleAddButton}>
                {isUpdate ? 'Update' : 'Add'}
            </button>
            {isUpdate && (
                <button className="button-danger full-width" onClick={handleDeleteButton}>
                    Delete
                </button>
            )}
            {message && <p>{message}: {account_nickname} - {account_type}- {currencyFormatter.format(balance || 0)}</p>}
        </div>
    )
}


export default CreateAccount

import { useEffect, useState } from "react"
import fileApiPost from "../../utils/fileapi"
import Dialog from "@mui/material/Dialog"
import CreateTransactionCategory from "../categories/CreateTransactionCategory"
import CreateAccount from "../accounts/CreateAccount"
import '../global.css'

function UploadFiles({ onRefresh, target = null }) {
    const [message, setMessage] = useState('')
    const [file, setFile] = useState('')
    const [isExpenseOpen, setIsExpenseOpen] = useState(false)
    const [isIncomeOpen, setIsIncomeOpen] = useState(false)
    const [isAccountOpen, setIsAccountOpen] = useState(false)
    const [categorizeButton, setCategorizeButton] = useState(false)
    const [account, setAccount] = useState(target || {})
    const [accounts, setAccounts] = useState([])

    const handleAddButton = (event) => {
        event.preventDefault()
        const formData = new FormData()
        formData.append('file', file)
        formData.append('account', JSON.stringify(account))

        fileApiPost('/api/upload-files/', formData)
            .then((response) => {
                if (response.ok) {
                    setCategorizeButton(true)
                    onRefresh?.()
                }
                return response.json()
            })
            .then((data) => { setMessage(data.Message) })
    }

    const getAccounts = () => {
        fetch('/api/account', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => setAccounts(data))
    }

    useEffect(() => {
        getAccounts()
    }, [])

    useEffect(() => {
        setAccount(target || {})
    }, [target])

    return (
        <div className="upload-page">
            <form onSubmit={(event) => { handleAddButton(event); setMessage('Uploading File..') }}>
                <h1>Upload Files</h1>
                <p>Upload CSV from transaction history of accounts</p>
                <p>*Remove all sensitive information</p>
                <div className="upload-actions">
                    <p>Choose Account</p>
                    <select className="field" onChange={(e) => {
                        if (e.target.value === 'add_new') {
                            setIsAccountOpen(true)
                            return
                        }

                        setAccount(accounts.find(account => account.id == e.target.value))
                        setMessage('');
                        setCategorizeButton(false)
                    }}
                        value={account.id || ""}
                        disabled={Boolean(target)}>
                        <option value="" disabled hidden>Please choose...</option>
                        {accounts.map((account) => (
                            <option key={account.id}
                                value={account.id}>
                                {account.account_nickname} ({account.account_type})
                            </option>
                        ))}
                        {!target && <option value="add_new">Add new account...</option>}
                    </select>
                    <input type="file"
                        accept=".csv"
                        onChange={(e) => {
                            setFile(e.target.files[0]);
                            setMessage('');
                            setCategorizeButton(false)
                        }} />
                    <button
                        type="submit"
                        className="button-primary full-width">
                        Upload
                    </button>
                </div>


                {message && <p>{message}</p>}
            </form>

            {categorizeButton && <button className="button-primary" onClick={() => setIsExpenseOpen(true)}>Categorized Expenses</button>}
            <Dialog open={isExpenseOpen} onClose={() => setIsExpenseOpen(false)}>
                <CreateTransactionCategory type="expense" onRefresh={onRefresh} />
            </Dialog>

            {categorizeButton && <button className="button-primary" onClick={() => setIsIncomeOpen(true)}>Categorized Income</button>}
            <Dialog open={isIncomeOpen} onClose={() => setIsIncomeOpen(false)}>
                <CreateTransactionCategory type="income" onRefresh={onRefresh} />
            </Dialog>

            <Dialog open={isAccountOpen} onClose={() => setIsAccountOpen(false)}>
                <CreateAccount
                    onRefresh={() => {
                        getAccounts()
                        onRefresh?.()
                    }}
                    onClose={() => setIsAccountOpen(false)}
                />
            </Dialog>
        </div>
    )
}
// TODO add dropdown menu to ask user of the date format
export default UploadFiles

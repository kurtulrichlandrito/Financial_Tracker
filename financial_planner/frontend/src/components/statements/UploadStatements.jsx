import { useEffect, useState } from "react"
import fileApiPost from "../../utils/fileapi"
import Dialog from "@mui/material/Dialog"
import CreateTransactionCategory from "../categories/CreateTransactionCategory"
import '../global.css'

function UploadFiles({ onRefresh }) {
    const [message, setMessage] = useState('')
    const [file, setFile] = useState('')
    const [isExpenseOpen, setIsExpenseOpen] = useState(false)
    const [isIncomeOpen, setIsIncomeOpen] = useState(false)
    const [categorizeButton, setCategorizeButton] = useState(false)
    const [account, setAccount] = useState({})
    const [accounts, setAccounts] = useState([])

    const handleAddButton = () => {
        event.preventDefault()
        const formData = new FormData()
        formData.append('file', file)
        formData.append('account', JSON.stringify(account))

        fileApiPost('/api/upload-files/', formData)
            .then((response) => {
                if (response.ok) {
                    setCategorizeButton(true)
                    onRefresh()
                }
                return response.json()
            })
            .then((data) => { setMessage(data.Message) })
    }

    useEffect(() => {
        fetch('/api/account', {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => setAccounts(data))
    }, [])

    return (
        <div className="upload-page">
            <form onSubmit={() => { handleAddButton(); setMessage('Uploading File..') }}>
                <h1>Upload Files</h1>
                <p>Upload CSV from transaction history of accounts</p>
                <p>*Remove all sensitive information</p>
                <div className="upload-actions">
                    <p>Choose Account</p>
                    <select className="field" onChange={(e) => {
                        setAccount(accounts.find(account => account.id == e.target.value))
                        setMessage('');
                        setCategorizeButton(false)
                    }}
                        defaultValue={""}>
                        <option value="" disabled hidden>Please choose...</option>
                        {accounts.map((account) => (
                            <option key={account.id}
                                value={account.id}>
                                {account.account_nickname} ({account.account_type})
                            </option>
                        ))}
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
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            justifyContent: 'center'
                        }}>
                        Upload
                    </button>
                </div>


                {message && <p>{message}</p>}
            </form>

            {categorizeButton && <button className="btn btn-primary" onClick={() => setIsExpenseOpen(true)}>Categorized Expenses</button>}
            <Dialog open={isExpenseOpen} onClose={() => setIsExpenseOpen(false)}>
                <CreateTransactionCategory type="expense" />
            </Dialog>

            {categorizeButton && <button className="btn btn-primary" onClick={() => setIsIncomeOpen(true)}>Categorized Income</button>}
            <Dialog open={isIncomeOpen} onClose={() => setIsIncomeOpen(false)}>
                <CreateTransactionCategory type="income" />
            </Dialog>
        </div>
    )
}
// TODO add dropdown menu to ask user of the date format
export default UploadFiles
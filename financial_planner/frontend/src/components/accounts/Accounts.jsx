import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Dialog from '@mui/material/Dialog'
import CreateAccount from "./CreateAccount"
import UploadFiles from "../statements/UploadStatements"
import currencyFormatter from "../../utils/currencyFormatter"

function Accounts({ globalRefresh, onRefresh }) {
    const [open, setOpen] = useState({})
    const [accounts, setAccounts] = useState([])
    const [target, setTarget] = useState()
    const [refresh, setRefresh] = useState(false)

    const toggle = (component, state) => setOpen((current) => ({ ...current, [component]: state }))

    const getAccounts = () => {
        fetch('/api/account/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setAccounts(data))
    }

    const refreshAccounts = () => {
        setRefresh((current) => !current)
        onRefresh?.()
    }

    useEffect(() => {
        getAccounts()
    }, [globalRefresh, refresh])

    return (
        <div className="page-stack">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Accounts</h1>
                    <p className="page-subtitle">Manage bank, savings, and credit accounts.</p>
                </div>
                <button className="button-primary" onClick={() => toggle('create', true)}>
                    + Add Account
                </button>
            </div>

            {accounts.length === 0 ? (
                <div className="empty-state">
                    <h2 className="empty-state__title">No accounts yet</h2>
                    <p className="empty-state__text">Add your first account to start importing transactions.</p>
                    <button className="button-primary" onClick={() => toggle('create', true)}>
                        Add Account
                    </button>
                </div>
            ) : (
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <td>Name</td>
                                <td>Type</td>
                                <td>Balance</td>
                                <td>Last Updated</td>
                                <td>Actions</td>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account) => (
                                <tr key={account.id}>
                                    <td>
                                        <Link className="link" to={`/accounts/${account.id}`}>
                                            {account.account_nickname}
                                        </Link>
                                    </td>
                                    <td><span className="tag tag-neutral">{account.account_type}</span></td>
                                    <td className="money">{currencyFormatter.format(account.balance)}</td>
                                    <td>{account.date_updated || 'N/A'}</td>
                                    <td>
                                        <div className="inline-actions">
                                            <button className="button-secondary" onClick={() => {
                                                setTarget(account)
                                                toggle('update', true)
                                            }}>
                                                Edit
                                            </button>
                                            <button className="button-secondary" onClick={() => {
                                                setTarget(account)
                                                toggle('upload', true)
                                            }}>
                                                Upload
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog open={!!open.create} onClose={() => toggle('create', false)}>
                <CreateAccount onRefresh={refreshAccounts} onClose={() => toggle('create', false)} />
            </Dialog>

            <Dialog open={!!open.update} onClose={() => toggle('update', false)}>
                <CreateAccount target={target} onRefresh={refreshAccounts} onClose={() => toggle('update', false)} />
            </Dialog>

            <Dialog open={!!open.upload} onClose={() => toggle('upload', false)}>
                <UploadFiles target={target} onRefresh={refreshAccounts} onClose={() => toggle('upload', false)} />
            </Dialog>
        </div>
    )
}

export default Accounts

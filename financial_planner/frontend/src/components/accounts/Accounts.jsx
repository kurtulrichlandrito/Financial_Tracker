import { useEffect, useState } from "react"
import '../categories.css'
import Dialog from '@mui/material/Dialog'
import CreateAccount from "./CreateAccount"
import UploadFiles from "../statements/UploadStatements"

function Accounts({ globalRefresh, onRefresh }) {
    const [open, setOpen] = useState({})
    const [accounts, setAccounts] = useState([])
    const [message, setMessage] = useState('')
    const [target, setTarget] = useState()
    const [refresh, setRefresh] = useState(false)

    const toggle = (component, state) => setOpen(open => ({ ...open, [component]: state }))

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
        <div className="account-page">
            <h1>Accounts</h1>
            <button onClick={() => toggle('create', true)}>+ Add Account</button>
            <Dialog open={!!open.create} onClose={() => toggle('create', false)}>
                <CreateAccount
                    onRefresh={refreshAccounts}
                    onClose={() => toggle('create', false)}
                />
            </Dialog>

            <div>
                <p>My Accounts</p>
                {accounts.map((account) => {
                    return <div key={account.id} style={{ padding: '1rem' }}>
                        <h4>{account.account_nickname}</h4>
                        <p>{account.account_type} - AccountNumber(to add)</p>
                        <h4>${account.balance}</h4>
                        <p>{account.account_type !== 'credit' ? 'Current balance' : 'Outstanding Balance'}</p>
                        <p>Monthly Spending: </p>
                        <p>Date updated:{account.date_updated ? account.date_updated : 'N/A'} </p>
                        <button onClick={() => {
                            toggle('update', true)
                            setTarget(account)
                        }}>Edit</button>
                        <br />
                        <button onClick={() => {
                            setTarget(account)
                            toggle('upload', true)
                        }}>Upload Statement</button>
                    </div>
                })}
                <Dialog open={!!open.update} onClose={() => toggle('update', false)}>
                    <CreateAccount
                        target={target}
                        onRefresh={refreshAccounts}
                        onClose={() => toggle('update', false)}
                    />
                </Dialog>

                <Dialog open={!!open.upload} onClose={() => toggle('upload', false)}>
                    <UploadFiles
                        target={target}
                        onRefresh={refreshAccounts}
                        onClose={() => toggle('upload', false)}
                    />
                </Dialog>
            </div>
        </div>
    )
}


export default Accounts

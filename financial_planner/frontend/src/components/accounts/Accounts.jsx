import { useEffect, useState } from "react"
import apiPost from '../../utils/api'
import '../categories.css'

function Accounts() {
    const [accounts, setAccounts] = useState([])
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetch('/api/account/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setAccounts(data))
    }, [])

    return (
        <div className="account-page">
            <h1>Accounts</h1>
            <button onClick={() => console.log(accounts)}>+ Add Account</button>
            <div>
                <table>
                    <thead>
                        <tr>
                            <td>Asset</td>
                            <td>Liability</td>
                            <td> Net worth</td>
                        </tr>
                    </thead>

                </table>
            </div>
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
                        <button>Edit</button>
                        <br />
                        <button>Upload Statement</button>
                    </div>
                })}
            </div>
            <div>
                <h4>Accounts Recent transaction</h4>

            </div>
        </div>
    )
}


export default Accounts
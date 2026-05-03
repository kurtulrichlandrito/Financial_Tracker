import { useEffect, useState } from "react"
import { Link, useNavigate, useOutletContext } from "react-router-dom"
import Dialog from '@mui/material/Dialog'
import CreateAccount from "../components/accounts/CreateAccount"
import CreateTransaction from "../components/transactions/CreateTransaction"
import UploadFiles from "../components/statements/UploadStatements"
import Charts from "../components/charts/Charts"
import currencyFormatter from "../utils/currencyFormatter"
import apiPost from "../utils/api"

function DashboardPage() {
    const { globalRefresh, reload } = useOutletContext()
    const [netWorth, setNetWorth] = useState({})
    const [recentTransactions, setRecentTransactions] = useState([])
    const [open, setOpen] = useState({})
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    const toggle = (key, state) => setOpen((current) => ({ ...current, [key]: state }))

    useEffect(() => {
        fetch('/api/net-worth/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setNetWorth(data))

        fetch('/api/transactions/?type=all&orderby=-transaction_date', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((data) => setRecentTransactions(data.slice(0, 10)))
    }, [globalRefresh])

    const handleSearch = (event) => {
        event.preventDefault()
        navigate(`/transactions?q=${encodeURIComponent(search)}`)
    }

    const handleAddBankAccount = async () => {
        apiPost('/api/create-user-token')
            .then((response) => response.json())
            .then((data) => localStorage.setItem('link_token', data.link_token))
    }

    return (
        <div className="page-stack">
            <section className="dashboard-hero">
                <p className="eyebrow">Overview</p>
                <h1 className="page-title">Your financial pulse</h1>
                <div className="stat-strip">
                    <div className="stat-card">
                        <p className="stat-card__label">Net Worth</p>
                        <p className="stat-card__value">{currencyFormatter.format(netWorth.net_worth || 0)}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-card__label">Total Assets</p>
                        <p className="stat-card__value">{currencyFormatter.format(netWorth.total_assets || 0)}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-card__label">Total Liabilities</p>
                        <p className="stat-card__value">{currencyFormatter.format(netWorth.total_liabilities || 0)}</p>
                    </div>
                </div>
            </section>

            <section className="action-grid">
                <button className="action-card" onClick={() => toggle('transaction', true)}>+ Add Transaction</button>
                <button className="action-card" onClick={() => toggle('upload', true)}>Upload Statement</button>
                <button className="action-card" onClick={() => toggle('account', true)}>+ Add Account</button>
                <button className="action-card" onClick={() => handleAddBankAccount()}>Link Bank Account</button>
            </section>

            <form className="page-card" onSubmit={handleSearch}>
                <label>Search transactions</label>
                <div className="search-row">
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search descriptions..." />
                    <button className="button-primary">Search</button>
                </div>
            </form>

            <section className="grid-two">
                <div className="page-card">
                    <div className="page-header">
                        <h2 className="page-title">Recent Transactions</h2>
                        <Link className="link" to="/transactions">View all</Link>
                    </div>
                    <div className="table-scroll">
                        <table>
                            <tbody>
                                {recentTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.transaction_date}</td>
                                        <td>{transaction.transaction_notes}</td>
                                        <td>{transaction.transaction_category_name || 'Uncategorized'}</td>
                                        <td className="money">{currencyFormatter.format(transaction.transaction_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="page-card">
                    <h2 className="page-title">Current Month Spending</h2>
                    <Charts type="expense" globalRefresh={globalRefresh} />
                </div>
            </section>

            <Dialog open={!!open.transaction} onClose={() => toggle('transaction', false)}>
                <CreateTransaction type="expense" onRefresh={() => { reload(); toggle('transaction', false) }} />
            </Dialog>
            <Dialog open={!!open.upload} onClose={() => toggle('upload', false)}>
                <UploadFiles onRefresh={reload} />
            </Dialog>
            <Dialog open={!!open.account} onClose={() => toggle('account', false)}>
                <CreateAccount onRefresh={reload} onClose={() => toggle('account', false)} />
            </Dialog>
        </div>
    )
}

export default DashboardPage

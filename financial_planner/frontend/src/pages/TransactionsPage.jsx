import { useState } from "react"
import { Link, useOutletContext, useSearchParams } from "react-router-dom"
import TransactionList from "../components/transactions/TransactionsList"

function TransactionsPage() {
    const { globalRefresh, reload } = useOutletContext()
    const [searchParams] = useSearchParams()
    const [type, setType] = useState(searchParams.get('type') || 'expense')

    return (
        <div className="page-stack">
            <div className="page-card page-header">
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-subtitle">Full ledger with edit and delete actions.</p>
                </div>
                <div className="page-header__actions">
                    <select value={type} onChange={(event) => setType(event.target.value)}>
                        <option value="expense">Expenses</option>
                        <option value="income">Income</option>
                        <option value="transfer">Transfers</option>
                        <option value="all">All</option>
                    </select>
                    <Link className="button-primary" to="/transactions/import">Import CSV</Link>
                </div>
            </div>
            <section className="page-card">
                <TransactionList type={type} globalRefresh={globalRefresh} onRefresh={reload} showCreate={type !== 'all'} />
            </section>
        </div>
    )
}

export default TransactionsPage

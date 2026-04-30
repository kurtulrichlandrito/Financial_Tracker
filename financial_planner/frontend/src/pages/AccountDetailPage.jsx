import { useEffect, useState } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import UploadFiles from "../components/statements/UploadStatements"
import currencyFormatter from "../utils/currencyFormatter"

function AccountDetailPage() {
    const { reload } = useOutletContext()
    const { id } = useParams()
    const [account, setAccount] = useState(null)

    useEffect(() => {
        fetch('/api/account/', {
            method: 'GET',
            credentials: 'include'
        })
            .then((response) => response.json())
            .then((accounts) => setAccount(accounts.find((item) => String(item.id) === id)))
    }, [id])

    if (!account) {
        return <div className="page-card">Account not found.</div>
    }

    return (
        <div className="page-stack">
            <section className="page-card">
                <p className="eyebrow">Account detail</p>
                <h1 className="page-title">{account.account_nickname}</h1>
                <p className="page-subtitle">{account.account_type}</p>
                <p className="stat-card__value">{currencyFormatter.format(account.balance)}</p>
            </section>
            <section className="page-card">
                <UploadFiles target={account} onRefresh={reload} />
            </section>
        </div>
    )
}

export default AccountDetailPage

import { Link, useOutletContext } from "react-router-dom"
import NetWorth from "../components/networth/NetWorth"

function NetWorthPage() {
    const { globalRefresh } = useOutletContext()

    return (
        <div className="page-stack">
            <div className="page-card page-header">
                <div>
                    <h1 className="page-title">Net Worth</h1>
                    <p className="page-subtitle">Assets minus liabilities.</p>
                </div>
                <div className="page-header__actions">
                    <Link className="button-secondary" to="/assets">Assets</Link>
                    <Link className="button-secondary" to="/liabilities">Liabilities</Link>
                </div>
            </div>
            <section className="page-card">
                <NetWorth globalRefresh={globalRefresh} />
            </section>
        </div>
    )
}

export default NetWorthPage

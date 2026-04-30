import { useOutletContext } from "react-router-dom"
import Charts from "../components/charts/Charts"

function ChartsPage() {
    const { globalRefresh } = useOutletContext()

    return (
        <div className="page-stack">
            <div className="page-card">
                <h1 className="page-title">Charts</h1>
                <p className="page-subtitle">Income and expense category breakdowns.</p>
            </div>
            <section className="grid-two">
                <div className="page-card">
                    <Charts type="expense" globalRefresh={globalRefresh} />
                </div>
                <div className="page-card">
                    <Charts type="income" globalRefresh={globalRefresh} />
                </div>
            </section>
        </div>
    )
}

export default ChartsPage

import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import CreateTransactionCategory from "../components/categories/CreateTransactionCategory"

function CategoriesPage() {
    const { globalRefresh, reload } = useOutletContext()
    const [type, setType] = useState('expense')

    return (
        <div className="page-stack">
            <div className="page-card">
                <h1 className="page-title">Categories</h1>
                <p className="page-subtitle">Manage categories while bulk-categorizing uncategorized transactions.</p>
                <div className="pill-row">
                    {['expense', 'income'].map((item) => (
                        <button
                            key={item}
                            className={type === item ? 'button-primary' : 'button-secondary'}
                            onClick={() => setType(item)}>
                            {item}
                        </button>
                    ))}
                </div>
            </div>
            <section className="page-card">
                <CreateTransactionCategory type={type} globalRefresh={globalRefresh} onRefresh={reload} />
            </section>
        </div>
    )
}

export default CategoriesPage

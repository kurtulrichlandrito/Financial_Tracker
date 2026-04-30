import { useOutletContext } from "react-router-dom"
import Accounts from "../components/accounts/Accounts"

function AccountsPage() {
    const { globalRefresh, reload } = useOutletContext()

    return (
        <section className="page-card">
            <Accounts globalRefresh={globalRefresh} onRefresh={reload} />
        </section>
    )
}

export default AccountsPage

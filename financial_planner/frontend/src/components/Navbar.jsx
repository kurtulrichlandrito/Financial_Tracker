import { useNavigate } from "react-router-dom"



export default function SideBar() {
    const navigate = useNavigate()
    return (
        <aside className="legacy-sidebar">
            <nav>
                <div>
                    <h1>Nav goes here</h1>
                </div>
                <ul>
                    <li>Accounts</li>
                    <li>Budgeting</li>
                    <li>Reports</li>
                    <li>Expenses</li>
                    <li>Income</li>
                    <li>Net Worth</li>
                </ul>
                <div>

                </div>
            </nav>
        </aside>
    )
}

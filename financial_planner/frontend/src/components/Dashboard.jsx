import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from '@mui/material/Dialog'
import apiPost from '../utils/api'
import CreateTransactionCategory from "./categories/CreateTransactionCategory";
import UploadFiles from "./statements/UploadStatements";
import CreateAsset from "./asset/CreateAsset";
import CreateLiability from "./liabilities/CreateLiability";
import ExpenseList from "./expenses/ExpenseList";
import AssetList from "./asset/AssetList"
import LiabilityList from "./liabilities/LiabilityList";
import IncomeList from "./income/IncomeList";
import Charts from "./charts/Charts";
import CreateAccount from "./accounts/CreateAccount";
import './global.css'
import './Dashboard.css'

const ACTIONS = [
    { key: 'expense', label: 'Expense Category', icon: '🏷️' },
    { key: 'income', label: 'Income Category', icon: '💰' },
    { key: 'upload', label: 'Upload Statement', icon: '📤' },
    { key: 'asset', label: 'Add Asset', icon: '📈' },
    { key: 'liability', label: 'Add Liability', icon: '📉' },
    { key: 'account', label: 'Add Account', icon: '🏦' },
]

function Dashboard() {
    const [open, setOpen] = useState({})
    const [globalRefresh, setGlobalRefresh] = useState(false)
    const navigate = useNavigate()

    const toggle = (component, state) => setOpen(open => ({ ...open, [component]: state }))

    const Logout = () => {
        apiPost('/api/logout/')
            .then(r => r.json())
            .then(d => { if (d.Message === 'Logout Successful') navigate('/login') })
    }
    const reload = () => {
        setGlobalRefresh(!globalRefresh)
    }

    return (
        <div id="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <button className="btn btn-ghost" onClick={Logout}>Logout</button>
            </div>

            <div className="dashboard-charts">
                <div className="card"><Charts type="expense" globalRefresh={globalRefresh} /></div>
                <div className="card"><Charts type="income" globalRefresh={globalRefresh} /></div>
            </div>

            <h2>Quick Actions</h2>
            <div className="dashboard-actions">
                {ACTIONS.map(({ key, label, icon }) => (
                    <button key={key} className="action-card" onClick={() => toggle(key, true)}>
                        <span>{icon}</span>{label}
                    </button>
                ))}
            </div>

            <Dialog open={!!open.expense} onClose={() => toggle('expense', false)}>
                <CreateTransactionCategory type="expense" onRefresh={reload} />
            </Dialog>
            <Dialog open={!!open.income} onClose={() => toggle('income', false)}>
                <CreateTransactionCategory type="income" globalRefresh={globalRefresh} onRefresh={reload} />
            </Dialog>
            <Dialog open={!!open.upload} onClose={() => toggle('upload', false)}>
                <UploadFiles onRefresh={reload} />
            </Dialog>
            <Dialog open={!!open.asset} onClose={() => toggle('asset', false)}>
                <CreateAsset />
            </Dialog>
            <Dialog open={!!open.liability} onClose={() => toggle('liability', false)}>
                <CreateLiability />
            </Dialog>
            <Dialog open={!!open.account} onClose={() => toggle('account', false)}>
                <CreateAccount />
            </Dialog>

            <div className="dashboard-tables">
                <div className="card">
                    <ExpenseList globalRefresh={globalRefresh} onRefresh={reload} />
                </div>
                <div className="card"><IncomeList globalRefresh={globalRefresh} onRefresh={reload} />
                </div>
                <div className="card">
                    <AssetList globalRefresh={globalRefresh} />
                </div>
                <div className="card">
                    <LiabilityList globalRefresh={globalRefresh} onRefresh={reload} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard

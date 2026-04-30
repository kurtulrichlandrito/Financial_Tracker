import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from '@mui/material/Dialog'
import apiPost from '../utils/api'
import CreateTransactionCategory from "./categories/CreateTransactionCategory";
import UploadFiles from "./statements/UploadStatements";
import CreateAsset from "./asset/CreateAsset";
import CreateLiability from "./liabilities/CreateLiability";
import AssetList from "./asset/AssetList"
import LiabilityList from "./liabilities/LiabilityList";
import Charts from "./charts/Charts";
import CreateAccount from "./accounts/CreateAccount";
import Accounts from "./accounts/Accounts";
import './global.css'
import './Dashboard.css'
import Navbar from './Navbar'
import NetWorth from "./networth/NetWorth";
import SearchTransactions from './search/SearchTransactions'
import Reports from './reporting/Reporting'
import Expenses from "./expenses/Expenses";
import Incomes from "./income/Incomes";
import TransactionList from './transactions/TransactionsList'
import Transfers from "./transfers/Transfers";

const quickActions = [
    { key: 'expenseCategory', label: 'Expense Category', icon: '🏷️' },
    { key: 'incomeCategory', label: 'Income Category', icon: '💰' },
    { key: 'upload', label: 'Upload Statement', icon: '📤' },
    { key: 'asset', label: 'Add Asset', icon: '📈' },
    { key: 'liability', label: 'Add Liability', icon: '📉' },
    { key: 'account', label: 'Add Account', icon: '🏦' },
    { key: 'accounts', label: 'Accounts', icon: '🏦' },
    { key: 'netWorth', label: 'Net Worth', icon: '🪙' },
    { key: 'expenses', label: 'Expenses', icon: '🪙' },
    { key: 'incomes', label: 'Incomes', icon: '🪙' },
    { key: 'reporting', label: 'Reporting', icon: '🪙' },
    { key: 'transfers', label: 'Transfers', icon: '🪙' },
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
            <Navbar />
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <button className="btn btn-ghost" onClick={Logout}>Logout</button>
            </div>

            {/* <div className="dashboard-charts">
                <div className="card"><Charts type="expense" globalRefresh={globalRefresh} /></div>
                <div className="card"><Charts type="income" globalRefresh={globalRefresh} /></div>
            </div> */}

            <h2>Quick Actions</h2>
            <div className="dashboard-actions">
                {quickActions.map(({ key, label, icon }) => (
                    <button key={key} className="action-card" onClick={() => toggle(key, true)}>
                        <span>{icon}</span>{label}
                    </button>
                ))}
            </div>

            <Dialog open={!!open.expenseCategory} onClose={() => toggle('expenseCategory', false)}>
                <CreateTransactionCategory type="expense" onRefresh={reload} />
            </Dialog>
            <Dialog open={!!open.incomeCategory} onClose={() => toggle('incomeCategory', false)}>
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
            <Dialog open={!!open.accounts} onClose={() => toggle('accounts', false)}>
                <Accounts />
            </Dialog>
            <Dialog open={!!open.account} onClose={() => toggle('account', false)}>
                <CreateAccount />
            </Dialog>
            <Dialog open={!!open.netWorth} onClose={() => toggle('netWorth', false)}>
                <NetWorth />
            </Dialog>
            <Dialog open={!!open.reporting} onClose={() => toggle('reporting', false)}>
                <Reports />
            </Dialog>
            <Dialog open={!!open.expenses} onClose={() => toggle('expenses', false)}>
                <Expenses />
            </Dialog>
            <Dialog open={!!open.incomes} onClose={() => toggle('incomes', false)}>
                <Incomes />
            </Dialog>
            <Dialog open={!!open.transfers} onClose={() => toggle('transfers', false)}>
                <Transfers />
            </Dialog>

            <div className="dashboard-tables">
                <div className="card">
                    <TransactionList type='expense' globalRefresh={globalRefresh} onRefresh={reload} />
                </div>
                <div className="card">
                    <TransactionList type='income' globalRefresh={globalRefresh} onRefresh={reload} />
                </div>
                <div className="card">
                    <TransactionList type='transfer' globalRefresh={globalRefresh} onRefresh={reload} />
                </div>
                <div className="card">
                    <AssetList globalRefresh={globalRefresh} onRefresh={reload} />
                </div>
                <div className="card">
                    <LiabilityList globalRefresh={globalRefresh} onRefresh={reload} />
                </div>
                <div className="card">

                </div>
            </div>
            <div>
                <h2>Search</h2>
                <SearchTransactions />

            </div>
        </div>
    )
}

export default Dashboard

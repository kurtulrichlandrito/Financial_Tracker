import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateExpenseCategory from "./categories/CreateExpenseCategory"
import Dialog from '@mui/material/Dialog'
import apiPost from '../utils/api'
import CreateIncomeCategory from "./categories/CreateIncomeCategory";
import UploadFiles from "./statements/UploadStatements";
import CreateAsset from "./asset/CreateAsset";
import CreateLiability from "./liabilities/CreateLiability";
import ExpenseList from "./expenses/ExpenseList";
import AssetList from "./asset/AssetList"
import LiabilityList from "./liabilities/LiabilityList";
import IncomeList from "./income/IncomeList";
import CreateTransactionCategory from "./categories/CreateExpenseCategory";

function Dashboard() {
    const [isExpenseOpen, setExpenseIsOpen] = useState(false)
    const [isIncomeOpen, setIncomeIsOpen] = useState(false)
    const [isUploadOpen, setUploadIsOpen] = useState(false)
    const [isAssetOpen, setAssetIsOpen] = useState(false)
    const [isLiabilityOpen, setLiabilityIsOpen] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const navigate = useNavigate()


    const Logout = () => {
        apiPost('/api/logout/')
            .then(response => response.json())
            .then(data => {
                if (data.Message === 'Logout Successful') {
                    navigate('/login')
                }
            })
    }
    return (
        <div>
            <h1>THIS IS THE DASHBOARD</h1>
            <div>
                <h2>Account Overview</h2>
            </div>

            <div>
                <h2>Monthly Overview</h2>
            </div>
            <div>
                <h2>Details Window</h2>
                <h3>Add Categories</h3>
                <button onClick={() => setExpenseIsOpen(true)}>Expense Category</button>
                <Dialog open={isExpenseOpen} onClose={() => setExpenseIsOpen(false)}>
                    <CreateTransactionCategory type="expense" />
                </Dialog>
                <p>Add Expense Category</p>
                <button onClick={() => setIncomeIsOpen(true)}>Income Category</button>
                <Dialog open={isIncomeOpen} onClose={() => setIncomeIsOpen(false)}>
                    <CreateTransactionCategory type="income" />
                </Dialog>
                <p>Add Income Category</p>
                <button onClick={() => setUploadIsOpen(true)}>Upload</button>
                <Dialog open={isUploadOpen} onClose={() => setUploadIsOpen(false)}>
                    <UploadFiles onSubmit={() => setRefresh(!refresh)} refresh={refresh} />
                </Dialog>
                <p>Add Bank Statements</p>
                <button onClick={() => setAssetIsOpen(true)}>Asset</button>
                <Dialog open={isAssetOpen} onClose={() => setAssetIsOpen(false)}>
                    <CreateAsset />
                </Dialog>
                <p>Add Asset</p>
                <button onClick={() => setLiabilityIsOpen(true)}>Liability</button>
                <Dialog open={isLiabilityOpen} onClose={() => setLiabilityIsOpen(false)}>
                    <CreateLiability />
                </Dialog>
                <p>Add Liability</p>

            </div>
            <button onClick={Logout}>Logout</button>
            <div>
                <h2>Temporary Expense Table</h2>
                <ExpenseList refresh={refresh} />
            </div>
            <div>
                <h2>Temporary Income Table</h2>
                <IncomeList refresh={refresh} />
            </div>
            <div>
                <h2>Temporary Asset</h2>
                <AssetList refresh={refresh} />
            </div>
            <div>
                <h2>Temporary Liability</h2>
                <LiabilityList refresh={refresh} />
            </div>
        </div>
    )

}

export default Dashboard
import { useState, useEffect } from "react"
import { apiDelete } from "../../utils/api"
import '../lists.css'
import TransactionList from '../transactions/TransactionsList'
function Expenses() {


    return (
        <div>
            <h1>All Expenses</h1>
            <TransactionList type='expense' />
        </div>
    )
}

export default Expenses
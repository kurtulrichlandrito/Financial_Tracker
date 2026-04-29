import { useState, useEffect } from "react"
import { apiDelete } from "../../utils/api"
import '../lists.css'
import TransactionList from '../transactions/TransactionsList'
function Incomes() {


    return (
        <div>
            <h1>All Incomes</h1>
            <TransactionList type='income' />
        </div>
    )
}

export default Incomes
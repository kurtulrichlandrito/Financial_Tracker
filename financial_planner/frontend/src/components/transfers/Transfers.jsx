import { useState, useEffect } from "react"
import { apiDelete } from "../../utils/api"
import '../lists.css'
import TransactionList from '../transactions/TransactionsList'
function Transfers() {


    return (
        <div>
            <h1>All Transfers</h1>
            <TransactionList type='transfer' />
        </div>
    )
}

export default Transfers
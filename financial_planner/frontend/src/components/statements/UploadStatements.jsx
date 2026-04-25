import { useState } from "react"
import fileApiPost from "../../utils/fileapi"
import Dialog from "@mui/material/Dialog"
import CreateExpenseCategory from "../categories/CreateExpenseCategory"

function UploadFiles() {
    const [message, setMessage] = useState('')
    const [file, setFile] = useState('')
    const [isExpenseOpen, setIsExpenseOpen] = useState(false)

    const handleAddButton = () => {
        const formData = new FormData()
        formData.append('file', file)
        fileApiPost('/api/upload-files', formData)
            .then((response) => {
                if (response.ok) {
                    setIsExpenseOpen(true)
                }
                return response.json()
            })
            .then((data) => setMessage(data.Message))
    }

    return (
        <div>
            <h1>Upload Files</h1>
            <p>Upload CSV from transaction history of accounts</p>
            <p>*Remove all sensitive information</p>
            <input type="file" accept=".csv" onChange={(e) => { setFile(e.target.files[0]); setMessage('') }} />
            <button onClick={handleAddButton}>Upload</button>
            {message && <p>{message}</p>}
            <Dialog open={isExpenseOpen} onClose={() => setIsExpenseOpen(false)}>
                <CreateExpenseCategory />
            </Dialog>
        </div>
    )
}
// TODO add dropdown menu to ask user of the date format
export default UploadFiles
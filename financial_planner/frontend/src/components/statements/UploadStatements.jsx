import { useState } from "react"
import fileApiPost from "../../utils/fileapi"

function UploadFiles() {
    const [message, setMessage] = useState('')
    const [file, setFile] = useState('')


    const handleAddButton = () => {
        const formData = new FormData()
        formData.append('file', file)
        fileApiPost('/api/upload-files', formData)
            .then((response) => response.json())
            .then((data) => setMessage(data.Message))
    }

    const handleFileChange = (e) => {

        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }
    return (
        <div>
            <h1>Upload Files</h1>
            <p>Upload CSV from transaction history of accounts</p>
            <p>*Remove all sensitive information</p>
            <input type="file" accept=".csv" onChange={() => handleFileChange, setMessage('')} />
            <button onClick={handleAddButton}>Upload</button>
            {message && <p>{message}</p>}
        </div>
    )
}
// TODO add dropdown menu to ask user of the date format
export default UploadFiles
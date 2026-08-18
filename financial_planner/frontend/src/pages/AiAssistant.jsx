import { useEffect, useState } from "react"
import fileApiPost from "../utils/fileapi"
import Dialog from "@mui/material/Dialog"


function AiAssistant({ onRefresh, target = null }) {

    return (
        <div className="ai-assistant-page">
            <Chat></Chat>
        </div>
    )
}

export default AiAssistant

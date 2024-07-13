import React from "react"
import { useAppContext } from "./AppContext"

const Sidebar = () => {
    const { mapData } = useAppContext()
    return (
        <div>
            {JSON.stringify(mapData, null, 2)}
        </div>
    )
}

export default Sidebar
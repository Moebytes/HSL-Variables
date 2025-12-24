import React from "react"
import "./styles/minibutton.css"

interface Props {
    text: string
    onClick?: () => void
}

const MiniButton: React.FunctionComponent<Props> = (props) => {
    return (
        <button className="minibutton" onClick={() => props.onClick?.()}>{props.text}</button>
    )
}

export default MiniButton
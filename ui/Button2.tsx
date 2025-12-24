import React from "react"
import "./styles/button2.css"

interface Props {
    text: string
    onClick?: () => void
}

const Button2: React.FunctionComponent<Props> = (props) => {
    return (
        <button className="button2" onClick={() => props.onClick?.()}>{props.text}</button>
    )
}

export default Button2
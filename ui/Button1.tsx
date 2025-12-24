import React, {useContext} from "react"
import {SelectContext} from "../ui"
import "./styles/button1.css"

interface Props {
    text: string
}

const Button1: React.FunctionComponent<Props> = (props) => {
    const {select, setSelect} = useContext(SelectContext)

    const active = select === props.text.toLowerCase()

    return (
        <button className={`button1 ${active && "button1-active"}`}
        onClick={() => setSelect(props.text.toLowerCase())}>{props.text}</button>
    )
}

export default Button1
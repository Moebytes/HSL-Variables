import React, {useContext} from "react"
import {SelectionItemsContext} from "../ui"
import "./styles/selectoption.css"

interface Props {
    color: string
    text: string
    data: VariableEntry | StyleEntry | FillEntry | StrokeEntry | EffectEntry
}

const SelectOption: React.FunctionComponent<Props> = (props) => {
    const {setSelectionItems} = useContext(SelectionItemsContext)

    const selectThis = () => {
        setSelectionItems((prev) => {
            const clone = structuredClone(prev)

            const items = [
                ...Object.values(clone.variableEntries),
                ...Object.values(clone.styleEntries),
                ...Object.values(clone.fillEntries),
                ...Object.values(clone.strokeEntries),
                ...Object.values(clone.effectEntries),
            ].flat()

            const item = items.find((i) => i.id === props.data.id)
            if (item) item.selected = !item.selected

            return clone
        })
    }

    return (
        <div className="select-option" onClick={selectThis} 
            style={{backgroundColor: props.data.selected ? "var(--selectOptionActive)" : ""}}>
            <div className="select-option-color" style={{backgroundColor: props.color}}></div>
            <span className="select-option-text">{props.text}</span>
        </div>
    )
}

export default SelectOption
import React, {useEffect, useState} from "react"
import {createRoot} from "react-dom/client"
import Button1 from "./ui/Button1"
import Button2 from "./ui/Button2"
import MiniButton from "./ui/MiniButton"
import SelectOption from "./ui/SelectOption"
import ColorSlider from "./ui/ColorSlider"
import "./ui.css"

interface Message {
    type: string
    select: string
    selectionItems: SelectionItems
}

type SelectContextType = {select: string; setSelect: React.Dispatch<React.SetStateAction<string>>}
export const SelectContext = React.createContext<SelectContextType>({select: "all", setSelect: () => null})

const defaultSelectItems = {variableEntries: {}, styleEntries: {}, fillEntries: {}, strokeEntries: {}, effectEntries: {}} as SelectionItems
type SelectionItemsContextType = {selectionItems: SelectionItems; setSelectionItems: React.Dispatch<React.SetStateAction<SelectionItems>>}
export const SelectionItemsContext = React.createContext<SelectionItemsContextType>({selectionItems: defaultSelectItems, setSelectionItems: () => null})

const App: React.FunctionComponent = () => {
    const [select, setSelect] = useState("all")
    const [hue, setHue] = useState(0)
    const [saturation, setSaturation] = useState(0)
    const [lightness, setLightness] = useState(0)
    const [selectionItems, setSelectionItems] = useState(defaultSelectItems)

    useEffect(() => {
        window.onmessage = (event: {data: {pluginMessage: Message}}) => {
            const msg = event.data.pluginMessage
            if (msg.type === "init-values") {
                if (msg.select) setSelect(msg.select)
            }
            if (msg.type === "selection-change") {
                setSelectionItems(msg.selectionItems)
            }
        }
    }, [])

    const reset = () => {
        setHue(0)
        setSaturation(0)
        setLightness(0)
        parent.postMessage({pluginMessage: {type: "update", reset: true, hue: 0, 
        saturation: 0, lightness: 0, select: "all", selectionItems: defaultSelectItems}}, "*")
    }

    useEffect(() => {
        parent.postMessage({pluginMessage: {type: "save-values", select}}, "*")
        reset()
    }, [select])

    const close = () => {
        parent.postMessage({pluginMessage: {type: "cancel"}}, "*")
    }

    const apply = () => {
        parent.postMessage({pluginMessage: {type: "apply"}}, "*")
    }

    useEffect(() => {
        parent.postMessage({pluginMessage: {type: "update", hue, saturation, lightness, select, selectionItems}}, "*")
    }, [hue, saturation, lightness, select, selectionItems])

    const printValue = (value: number) => {
        return value > 0 ? `+${value}` : `${value}`
    }

    const selectAllOptions = () => {
        setSelectionItems(prev => {
            const clone = structuredClone(prev)
            Object.values(clone).flatMap(Object.values).flat()
            .forEach(item => item.selected = true)
            return clone
        })
    }

    const deselectAllOptions = () => {
        setSelectionItems(prev => {
            const clone = structuredClone(prev)
            Object.values(clone).flatMap(Object.values).flat()
            .forEach(item => item.selected = false)
            return clone
        })
    }

    const generateSelectionOptions = () => {
        const jsx = [] as React.ReactElement[]
        const items = [
            ...Object.values(selectionItems.variableEntries),
            ...Object.values(selectionItems.styleEntries),
            ...Object.values(selectionItems.fillEntries),
            ...Object.values(selectionItems.strokeEntries),
            ...Object.values(selectionItems.effectEntries),
        ].flat()
        for (const item of items) {
            jsx.push(<SelectOption text={item.name} color={item.hexColor} data={item}/>)
        }
        return jsx
    }

    return (
        <SelectContext.Provider value={{select, setSelect}}>
        <SelectionItemsContext.Provider value={{selectionItems, setSelectionItems}}>
            <div className="column-container">
                <div className="row-container" style={{gap: "0.5rem"}}>
                    <Button1 text="All"/>
                    <Button1 text="Select"/>
                    {select === "select" ? <>
                    <MiniButton text="+" onClick={selectAllOptions}/>
                    <MiniButton text="x" onClick={deselectAllOptions}/>
                    </> : null}
                </div>
                {select === "select" ? <div className="column-container-scroll-parent">
                    <div className="column-container-scroll">
                        {generateSelectionOptions()}
                    </div>
                </div> : null}
                <div className="column-container-mini">
                    <div className="row-container space-between">
                        <span className="slider-label">Hue</span>
                        <span className="slider-value">{printValue(hue)}</span>
                    </div>
                    <div className="row-container">
                        <ColorSlider type="hue" value={hue} onChange={setHue} min={-180} max={180} reset={0}/>
                    </div>
                </div>
                <div className="column-container-mini">
                    <div className="row-container space-between">
                        <span className="slider-label">Saturation</span>
                        <span className="slider-value">{printValue(saturation)}</span>
                    </div>
                    <div className="row-container">
                        <ColorSlider type="saturation" value={saturation} onChange={setSaturation} min={-100} max={100} reset={0} hue={hue}/>
                    </div>
                </div>
                <div className="column-container-mini">
                    <div className="row-container space-between">
                        <span className="slider-label">Lightness</span>
                        <span className="slider-value">{printValue(lightness)}</span>
                    </div>
                    <div className="row-container">
                        <ColorSlider type="lightness" value={lightness} onChange={setLightness} min={-100} max={100} reset={0}/>
                    </div>
                </div>
                <div className="row-container-pad">
                    <Button2 text="Cancel" onClick={close}/>
                    <Button2 text="Apply" onClick={apply}/>
                </div>
            </div>
        </SelectionItemsContext.Provider>
        </SelectContext.Provider>
    )

}

window.addEventListener("DOMContentLoaded", () => {
    const root = createRoot(document.getElementById("root")!)
    root.render(<App/>)
})
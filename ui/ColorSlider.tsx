import React, {useRef, useState, useLayoutEffect} from "react"
import "./styles/colorslider.css"

interface Props {
    type: "hue" | "saturation" | "lightness"
    min: number
    max: number
    reset: number
    value?: number
    hue?: number
    onChange?: (value: number) => void
}

const handleSizeRem = 0.375

const ColorSlider: React.FunctionComponent<Props> = (props) => {
    const [internalValue, setInternalValue] = useState(props.value ?? 0)
    const [handleLeft, setHandleLeft] = useState(0)
    const sliderRef = useRef<HTMLDivElement>(null)
    const draggingRef = useRef(false)

    const getGradient = () => {

        if (props.type === "hue") {
            return `linear-gradient(90deg, #F00 0%, #FF4E00 8%, #FFC400 17%, #EAF900 21.1%, 
            #8CFF00 25.6%, #2FFF00 31.1%, #00FFB2 44.1%, #0BF 54.1%, #0037FF 60%, 
            #6A00F5 70.01%, #FE00D4 83%, #FD007F 88.6%, #FF002B 95.5%, #FF0030 100%)`
        }

        if (props.type === "saturation") {
            return `linear-gradient(90deg, #808080 0%, #cbafae 8%, #c9b693 17%, #d2daa2 21.1%, 
            #afda8f 25.6%, #94db9c 31.1%, #8ed7bd 44.1%, #9ed6f3 54.1%, #8c8cfb 60%, #ab76f5 70.01%, 
            #ff6acb 83%, #ff578d 88.6%, #ff6363 95.5%, #ff0000 100%)`
        }

        if (props.type === "lightness") {
            return `linear-gradient(90deg, #000000 0%, #FFFFFF 100%)`
        }

        return "#000000"
    }

    const directUpdate = (value: number) => {
        if (props.onChange) {
            props.onChange(Math.round(value))
        } else {
            setInternalValue(Math.round(value))
        }
    }

    const updateValue = (clientX: number) => {
        if (!sliderRef.current) return

        const rect = sliderRef.current.getBoundingClientRect()
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width)
        const newValue = props.min + (x / rect.width) * (props.max - props.min)

        directUpdate(newValue)
    }

    const startDrag = (event: React.PointerEvent) => {
        draggingRef.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
        updateValue(event.clientX)
    }

    const stopDrag = (event: React.PointerEvent) => {
        draggingRef.current = false
        event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const onDrag = (event: React.PointerEvent) => {
        if (!draggingRef.current) return
        updateValue(event.clientX)
    }

    const value = props.onChange ? props.value ?? 0 : internalValue
    const percent = (value - props.min) / (props.max - props.min)

    const updateHandleLeft = () => {
        if (!sliderRef.current) return
        const sliderWidth = sliderRef.current.offsetWidth
        const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
        const handleSize = handleSizeRem * fontSize

        const usableWidth = sliderWidth - handleSize
        const pos = percent * usableWidth + handleSize / 2

        setHandleLeft(pos)
    }

    useLayoutEffect(() => {
        updateHandleLeft()
    }, [value, sliderRef.current?.offsetWidth])

    return (
        <div className="color-slider-container" onDoubleClick={() => directUpdate(props.reset)}>
            <div className="color-handle" style={{left: `${handleLeft}px`, width: `${handleSizeRem}rem`, 
            height: `${handleSizeRem}rem`, borderRadius: `${handleSizeRem}rem`}}></div>
            <div ref={sliderRef} className="color-slider" style={{background: getGradient()}}
            onPointerDown={startDrag} onPointerMove={onDrag} onPointerUp={stopDrag}></div>
        </div>
    )
}

export default ColorSlider
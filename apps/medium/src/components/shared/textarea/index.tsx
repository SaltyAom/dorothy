'use client'

import {
    useState,
    type DetailedHTMLProps,
    type TextareaHTMLAttributes,
    forwardRef,
    useEffect
} from 'react'

import './textarea.sass'

const TextArea = forwardRef<
    HTMLTextAreaElement,
    DetailedHTMLProps<
        TextareaHTMLAttributes<HTMLTextAreaElement>,
        HTMLTextAreaElement
    >
>(({ id, ...props }, ref) => {
    const [value, setValue] = useState('')

    useEffect(() => {
        if (props.defaultValue) setValue(props.defaultValue as string)
    }, [props.defaultValue])

    return (
        <div
            id={id}
            className="expanding-textarea"
            data-replicated-value={value}
        >
            <textarea
                ref={ref}
                rows={1}
                {...props}
                onInput={({ currentTarget: { value } }) => {
                    setValue(value)
                }}
            />
        </div>
    )
})

export default TextArea

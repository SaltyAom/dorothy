'use client'

import {
    useState,
    useRef,
    type DetailedHTMLProps,
    type TextareaHTMLAttributes,
    type MutableRefObject,
    type RefCallback,
    useEffect,
    forwardRef
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


export default function Container(props: { children: React.ReactNode, style?: string }) {
    return (
        <div className={`w-container h-1/2 bg-container rounded-xl relative flex flex-col px-4 pb-10 overflow-y-auto overflow-x-hidden ${props.style}`}>
            {props.children}
        </div>
    )
}
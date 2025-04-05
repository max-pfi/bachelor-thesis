

export const ContainerHeader = (props: { children: React.ReactNode, title: string, style?: string }) => {
    return (
        <div className="flex flex-row justify-between w-container items-baseline px-4 py-2">
            <h1 className="text-4xl font-medium">{props.title}</h1>
            {props.children}
        </div>
    )
}
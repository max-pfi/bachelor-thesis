export default function AppScreen(props: { children: React.ReactNode }) {

    return (
        <div className='w-screen h-screen flex flex-col justify-center items-center'>
            {props.children}
        </div>
    )
}


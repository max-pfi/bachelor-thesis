import '../App.css'

export default function AppScreen(props: { children: React.ReactNode }) {

    return (
        <div className='app'>
            {props.children}
        </div>
    )
}


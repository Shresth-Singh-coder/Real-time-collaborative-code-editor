import Avatar from "react-avatar"

export default function Users({ username }: { username: string } ) {
    return (
        <div className="flex flex-col items-center ">
            <Avatar name={username} size='50px' round="14px"/>
            <span className="text-sm flex flex-col items-center">{username}</span>
        </div>
    )
}
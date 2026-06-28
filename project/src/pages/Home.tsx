import { useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [ roomId, setRoomId ] = useState('');
    const [ username, setUsername ] = useState('');
    const navigate = useNavigate();

    const createNewRoom = (e:any) => {
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success("Room created");
    }

    const joinRoom = () => {
        if(roomId=='' || username=='') {
            toast.error("Username or RoomId incorrect!")
            return
        }

        navigate(`/editor/${roomId}`, {
            state: {
                username
            }
        })
    }

    const handleinputEnter = (e:any) => {
        if(e.code == 'Enter') {
            joinRoom()
        } 
    }

    return (
        <>
            <div className="bg-gray-800 h-screen w-screen flex items-center justify-center">
                <div className="bg-slate-900 h-3/5 min-w-sm rounded-3xl text-white flex flex-col p-8 gap-8 items-center">
                    <div className="text-5xl text-center underline decoration-sky-500">Code Editor</div>
                    <div>Paste inviatation room ID</div>
                    <div className="flex-col flex items-center justify-center gap-3 w-full">
                        <input type="text" placeholder="ROOM ID" onKeyUp={handleinputEnter} onChange = {(e) => setRoomId(e.target.value)} value = {roomId} className="bg-sky-50 text-black p-1 rounded-sm border-none outline-none w-full"/>
                        <input type="text" placeholder="USERNAME" onKeyUp={handleinputEnter} onChange = {(e) => setUsername(e.currentTarget.value)} value={username} className="bg-sky-50 text-black p-1 rounded-sm border-none outline-none w-full"/>
                    </div>
                    <div className="w-full">
                        <button className="bg-sky-500 w-20 h-8 rounded-sm w-full" onClick={joinRoom}>Join</button>
                    </div>
                    <div>
                        If you don't have invite then create <a onClick={createNewRoom} className="text-sky-500 cursor-pointer">new room</a>
                    </div>
                </div>
            </div>
        </>
    )
}
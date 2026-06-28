import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import toast from "react-hot-toast";

import Users from "../components/Users";
import EditorPanel from "../components/EditorPanel";
import ACTIONS from "../components/Actions";
import { initSocket } from "../socket";

type ClientType = {
  socketId: string;
  username: string;
};

type LocationState = {
  username: string;
};

export default function EditorPage() {
  const socketRef = useRef<Socket | null>(null);
  const codeRef = useRef<string>("");

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  const username = (location.state as LocationState | null)?.username;

  const [users, setUsers] = useState<ClientType[]>([]);

  useEffect(() => {
    
    if (!username || !roomId) return;
    console.log("EditorPage mounted");
    const init = async () => {
      try {
        socketRef.current = await initSocket();

        console.log("Socket created", socketRef.current);

        socketRef.current.on("connect", () => {
          console.log("Connected:", socketRef.current?.id);
        });

        socketRef.current.on("connect_error", handleErrors);
        socketRef.current.on("connect_failed", handleErrors);

        function handleErrors(err: unknown) {
          console.error("Socket error:", err);
          toast.error("Socket connection failed");
          navigate("/");
        }

        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username,
        });

        socketRef.current.on(
          ACTIONS.JOINED,
          ({
            clients,
            username: joinedUser,
            socketId,
          }: {
            clients: ClientType[];
            username: string;
            socketId: string;
          }) => {
            if (joinedUser !== username) {
              toast.success(`${joinedUser} joined the room`);
            }

            setUsers(clients);

            socketRef.current?.emit(ACTIONS.SYNC_CODE, {
              socketId,
              code: codeRef.current,
            });
          }
        );

        socketRef.current.on(
          ACTIONS.DISCONNECTED,
          ({
            socketId,
            username: leftUser,
          }: {
            socketId: string;
            username: string;
          }) => {
            toast.success(`${leftUser} left the room`);

            setUsers((prev) =>
              prev.filter((user) => user.socketId !== socketId)
            );
          }
        );
      } catch (err) {
        console.error(err);
        toast.error("Connection failed");
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
    };
  }, [roomId, username, navigate]);

  const copyRoomId = async () => {
    try {
      if (!roomId) return;
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch {
      toast.error("Could not copy Room ID");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex w-screen h-screen text-white">
      
      {/* Sidebar */}
      <div className="bg-slate-900 w-1/6 flex flex-col">

        {/* Logo */}
        <div className="h-[15%] text-3xl text-center underline decoration-sky-500 font-bold pt-5">
          Code Editor
        </div>

        {/* Users */}
        <div className="h-[70%] p-4">
          <div className="font-bold text-xl">Connected</div>

          <div className="flex flex-wrap gap-3 mt-5">
            {users.map((user) => (
              <Users key={user.socketId} username={user.username} />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="h-[15%] flex flex-col p-4 gap-3">
          <button
            onClick={copyRoomId}
            className="w-full font-bold bg-white text-black rounded-md py-2 hover:bg-gray-200 transition"
          >
            Copy Room ID
          </button>

          <button
            onClick={leaveRoom}
            className="w-full font-bold bg-green-400 text-black rounded-md py-2 hover:bg-green-500 transition"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="bg-slate-800 w-5/6 h-full">
        <EditorPanel
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code: string) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
}
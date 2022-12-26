import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../providers/Socket";

const Homepage = () => {
    const { socket } = useSocket();
    const navigate = useNavigate();

    const handleRoomjoined = useCallback(({ roomId }) => {
        navigate(`/room/${roomId}`);
    }, [navigate]);

    useEffect(() => {
        socket.on("joined-room", handleRoomjoined);
        return () => {
            socket.off("joined-room", handleRoomjoined);
        }
    }, [handleRoomjoined, socket]);

    const [email, setEmail] = useState();
    const [roomId, setRoomId] = useState();

    const handleJoinRoom = () => {
        socket.emit("join-room", { emailId: email, roomId });
    }
    return (
        <div className="homepage-container">
            <div className="input-container">
                <h3 className="homepage-tile"> Zoom Call App </h3>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter Your Email" />
                <input type="text" placeholder="Enter Your Room Code" value={roomId} onChange={e => setRoomId(e.target.value)} />
                <button onClick={handleJoinRoom}>Enter Room</button>
            </div>
        </div>
    )
}

export default Homepage;
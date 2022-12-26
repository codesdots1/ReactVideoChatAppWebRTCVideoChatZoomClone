import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

const RoomPage = () => {
    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream } = usePeer();
    const [myStream, setMyStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState();

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        const offer = await createOffer();
        socket.emit('call-user', { emailId, offer });
        setRemoteEmailId(emailId);
    }, [createOffer, socket]);

    const handleIncommingCall = useCallback(async (data) => {
        const { from, offer } = data;
        const ans = await createAnswer(offer);
        socket.emit('call-accepted', { emailId: from, ans });
        setRemoteEmailId(from);
    }, [createAnswer, socket]);

    const handleCallAccepted = useCallback(async (data) => {
        const { ans } = data;
        await setRemoteAnswer(ans);
    }, [setRemoteAnswer]);

    const getUserMediaStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
    }, []);

    const handleNegotiationNeeded = useCallback(() => {
        const localOffer = peer.localDescription;
        socket.emit('call-user', { emailId: remoteEmailId, offer: localOffer });
    }, []);

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incomming-call', handleIncommingCall);
        socket.on('call-accepted', handleCallAccepted);

        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incomming-call', handleIncommingCall);
            socket.off('call-accepted', handleCallAccepted);
        }

    }, [handleIncommingCall, handleCallAccepted, handleNewUserJoined, socket]);

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
        }
    }, [handleNegotiationNeeded]);

    useEffect(() => {
        getUserMediaStream();
    }, [getUserMediaStream]);

    return (
        <div className="room-page-container">
            <h1> Room Page </h1>
            <h4> You are connected to {remoteEmailId}</h4>
            <button onClick={e => sendStream(myStream)}> Send My Video </button>
            <ReactPlayer url={myStream} playing muted />
            <ReactPlayer url={remoteStream} playing />
        </div>
    )
}

export default RoomPage;
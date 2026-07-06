import { io, Socket } from "socket.io-client";
export let socket: Socket | null = null; 

export function connectSocket(userID: string) {
    socket = io(import.meta.env.VITE_API_URL, {
        query: {userID}
    })
}

export function disconnectSocket() {
    socket?.disconnect(); 
    socket = null; 
}
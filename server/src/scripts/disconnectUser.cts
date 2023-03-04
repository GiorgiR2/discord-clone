import { connectedUsersT, usersInVoiceI } from "../types/types.cjs";

const disconnectUser = (socket: any, connectedUsers: connectedUsersT, username: string): void => {
    if (connectedUsers[username] !== undefined) {
        connectedUsers[username].tabsOpen -= 1;
        if (connectedUsers[username].tabsOpen <= 0) {
            socket.broadcast.emit("offline", {
                username: username,
            });
            connectedUsers[username].status = "offline";
        }
    }
    console.log("disconnect", username, socket.id);
};

const emitDisconnect = (socket: any, io: any, roomIds: string[], usersInVoice: usersInVoiceI) => {
    // emit disconnect message for voice chat users
    roomIds.forEach((roomid) => {
        usersInVoice[roomid].forEach((user) => {
            if (user.id === socket.id) {
                usersInVoice[roomid].forEach((user0) => {
                    if (user0.id !== socket.id) {
                        console.log("'peerDisconnect' emitted...");
                        io.to(user0.id).emit("peerDisconnected", { id: socket.id });
                    }
                });
            }
        });
    });
}

// _id === socket.id
const popOut = (socketIds: string[], usersInVoice: usersInVoiceI, roomIds: string[], _id: string): void => {
    socketIds = socketIds.filter((id, n) => {
        if (id !== _id) {
            return id;
        }
        else {
            usersInVoice[roomIds[n]] = usersInVoice[roomIds[n]].filter((el) => el.id !== _id);
            roomIds = roomIds.filter((r, n0) => n0 !== n);
        }
    });
}

export {
    disconnectUser,
    emitDisconnect,
    popOut,
};
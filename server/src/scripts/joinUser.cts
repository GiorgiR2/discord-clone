import { connectedUsersT } from "../types/types.cjs";

import MessageModel, { messageSchemaI } from "../models/message.model.cjs";

const joinUser = (socket: any, connectedUsers: connectedUsersT, username: string, room: string) => {
    let user = connectedUsers[username];
    const id = socket.id;
    if (user === undefined) {
        connectedUsers[username] = { status: "online", tabsOpen: 1, socketIds: [id] };
    } else if (user.tabsOpen === 0) {
        connectedUsers[username].status = "online";
        connectedUsers[username].tabsOpen = 1;
        connectedUsers[username].socketIds.push(id);

        socket.broadcast.emit("online", { username });
    } else if (!user.socketIds.includes(id)) {
        connectedUsers[username].tabsOpen++;
        connectedUsers[username].socketIds.push(id);
    }

    Object.keys(connectedUsers).forEach((usr: string) => {
        if (connectedUsers[usr].tabsOpen > 0) {
            console.log(connectedUsers[usr]);
        }
    });

    // let status: connectedUsersT = connectedUsers;
    // Object.keys(status).forEach((userN: string) => {
    //     status[userN].socketIds = [];
    // });
    // socket.emit("status", status);
    socket.emit("status", connectedUsers);
    socket.join(room);
}

const sendInitMessages = (room: string): Promise<{ messages: messageSchemaI[] }> =>
    new Promise((resolve, reject) => {
        MessageModel.find({ room })
            .sort({ number: -1 })
            .limit(15)
            .exec()
            .then((doc: messageSchemaI[]) => resolve({ messages: doc.reverse() }));
    });

export { joinUser, sendInitMessages };
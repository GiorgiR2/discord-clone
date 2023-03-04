import { connectedUsersT } from "../types/types.cjs";

import MessageModel, { messageSchemaI } from "../models/message.model.cjs";

const join = (socket: any, connectedUsers: connectedUsersT, username: string, _room: string) => {
    if (connectedUsers[username] === undefined) {
        connectedUsers[username] = {
            status: "online",
            tabsOpen: 1,
        };
    } else if (connectedUsers[username].tabsOpen < 1) {
        connectedUsers[username].status = "online";

        socket.broadcast.emit("online", {
            username: username,
        });
        connectedUsers[username].tabsOpen = 1;
    } else {
        connectedUsers[username].tabsOpen += 1;
    }

    console.log(connectedUsers);
    socket.emit("status", connectedUsers);

    MessageModel.find({
        room: _room,
    })
        .sort("number")
        .exec()
        .then((doc: messageSchemaI[]) => {
            socket.emit("messagesData", doc);
        });

    socket.join(_room);
}

export { join };
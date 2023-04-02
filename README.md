# Discord Clone

Discord-like chat platform with all of the core features.

## Technologies Used
* React.js - front-end
* Redux - state managment
* Node - back-end
* socket.io - sending messages (and some other kind of data)
* WebRTC - p2p audio/video transfer + screen sharing

## Overview

live demo: [https://giorgir2.github.io/discord-clone/](https://giorgir2.github.io/discord-clone/)

## .env setup
Add server/.env file with PORT && MONGO_ADDRESS ```touch server/.env```

Example:
```sh
PORT = 5000
MONGO_ADDRESS = mongodb+srv://username:password!@cluster0.bb4he.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

## Installation

1. ```git clone https://github.com/GiorgiR2/discord-clone.git```
2. ```cd discord-mern```
3. Install Packages && Run back-end ```cd server && yarn install && yarn run build && yarn start```
4. Install Packages && Run front-end ```cd client && yarn install && yarn start```

## Features

* sending messages/files
* editing/deleting messages
* emojis
* multi user audio/video group chat
* screen sharing
* show active users
* add/edit/delete rooms
* dragNdrop/change rooms' positions
* hash based authentication
* auto login (remember logged in users)

## Screens
...

Main Chat Window

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/main.png)

Responsive View

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/responsive-screen.png)

Voice Chat Window

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/voice.png)

Login Window

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/login.png)

Sign Up window

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/signup.png)

## Contact

* Email: grakv2020@agruni.edu.ge


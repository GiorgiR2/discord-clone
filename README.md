# Discord Clone

## Technologies Used
* React.js - front-end
* Redux - state managment
* Node - back-end
* socket.io - sending messages / status bar data
* RestAPI
* WebRTC - p2p audio/video transfer

## Overview
...

## Getting Started

1. clone repo
```sh
git clone https://github.com/GiorgiR2/discord-clone.git
```

2. cd directory
```sh
cd discord-mern
```

3. add server/.env file with PORT && MONGO_ADDRESS

Example:

```sh
PORT = 5000
MONGO_ADDRESS = mongodb+srv://username:password!@cluster0.bb4he.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

4. Install Packages && Run Server-Side
```sh
cd server && npm i && npm start
```

5. Install Packages && Run Client-Side
```sh
cd client && npm i && npm start
```

## Functions

| Function                                  | Description                                       | Status                 |
|-------------------------------------------|---------------------------------------------------|------------------------|
| send messages/files                       | -                                                 | done                   |
| video/audio chat                          | p2p connection (using webrtc/simple-peer)         | under development      |
| add/edit/delete rooms                     | -                                                 | done                   |
| edit/delete messages                      | -                                                 | -                      |
| p2p audio/video chat                      | -                                                 | -                      |

## Screens
...

Main Chat Window

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/discord-mern.png)

Responsive View

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/responsive-screen.png)

Voice Chat Window

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/voice.png)

Login Window

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/login.png)

Sign Up window

![alt text](https://raw.githubusercontent.com/GiorgiR2/discord-clone/master/screens/signUp.png)

## Future Plans

Rewrite it all in Next.ts

## Contact

* Email: grakv2020@agruni.edu.ge


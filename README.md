# Discord Clone

## Technologies Used
* React.js - front-end
* Redux - state managment
* Node - back-end
* socket.io - sending messages (and some other kind of data)
* RestAPI
* WebRTC - p2p audio/video transfer

## Overview
...

## .env setup
Add server/.env file with PORT && MONGO_ADDRESS ```touch server/.env```

Example:
```sh
PORT = 5000
MONGO_ADDRESS = mongodb+srv://username:password!@cluster0.bb4he.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

## Installations

1. ```git clone https://github.com/GiorgiR2/discord-clone.git```
2. ```cd discord-mern```
3. Install Packages && Run back-end ```cd server && npm i && npm start```
4. Install Packages && Run front-end ```cd client && npm i && npm start```


## Functions

| Function                                  | Description                                       | Status                 |
|-------------------------------------------|---------------------------------------------------|------------------------|
| send messages/files                       | -                                                 | done                   |
| video/audio group chat                    | p2p connection (using webrtc/simple-peer)         | under development      |
| add/edit/delete rooms                     | -                                                 | done                   |
| edit/delete messages                      | -                                                 | -                      |
| hash based authentication                 | -                                                 | done                   |

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

Rewrite everything in Typescript

## Contact

* Email: grakv2020@agruni.edu.ge


# Discord Clone

## Technologies Used
* React.js - front-end
* Redux - state managment
* Node - back-end
* socket.io - sending messages (and some other kind of data)
* RestAPI
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
3. Install Packages && Run back-end ```cd server && npm i && npm start```
4. Install Packages && Run front-end ```cd client && npm i && npm start```


## Functions

| Function                                  | Description                                       | Status                 |
|-------------------------------------------|---------------------------------------------------|------------------------|
| send messages/files                       | -                                                 | done                   |
| video/audio group chat                    | webRTC p2p connection                             | done                   |
| screen share                              | -                                                 | done                   |
| add/edit/delete rooms                     | -                                                 | done                   |
| edit/delete messages                      | -                                                 | done                   |
| hash based authentication                 | -                                                 | done                   |
| auto login (remember logged in users)     | use localstorage to store authentication hash     | done                   |

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

## Future Plans

Rewrite everything in Typescript

## Contact

* Email: grakv2020@agruni.edu.ge


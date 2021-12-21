import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

import './_chat.sass';
import editIcon from '../../icons/edit-97.png';
import plusIcon from '../../icons/white-plus-icon-3.jpg';

import { getBasicData } from '../js/_getBasicData';
import { appendFile } from './_appendFile';

const chatRoomList = [
    "# room 1",
    "# room 2",
    "# room 3",
    "# room 4",
    "# room 5",
    "# room 6",
    "# room 7",
];

const voiceChatList = [
    "# voice 1",
    "# voice 2",
    "# voice 3",
];

const EditSVG = () => {
    return (
        <svg width="25" height="25" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
            d="M18.303 4.742L16.849 3.287C16.678 3.116 16.374 3.116 16.203 3.287L13.142 6.351H2.01901C1.76801 6.351 1.56201 6.556 1.56201 6.807V16.385C1.56201 16.636 1.76801 16.841 2.01901 16.841H15.702C15.954 16.841 16.159 16.636 16.159 16.385V7.533L18.303 5.387C18.481 5.208 18.483 4.917 18.303 4.742ZM15.258 15.929H2.47601V7.263H12.23L9.69501 9.792C9.63801 9.849 9.59401 9.922 9.57601 10.004L9.18001 11.36H5.20001C4.94901 11.36 4.74301 11.565 4.74301 11.816C4.74301 12.069 4.94801 12.272 5.20001 12.272H9.53601C9.55901 12.272 10.435 12.292 11.034 12.145C11.346 12.068 11.584 12.008 11.584 12.008C11.664 11.99 11.739 11.949 11.796 11.89L15.259 8.447V15.929H15.258ZM11.241 11.156L10.163 11.423L10.43 10.347L16.527 4.256L17.335 5.064L11.241 11.156Z"
            fill="#fff"/>
        </svg>
    );
}

const changeLabel = () => {
    /* -/- */
    console.log("fuck");
}

const addCategory = () => {
    // pass
}

const logOut = (e, history) => {
    e.preventDefault();
    axios.post("/api/users/logout", { junk: "" }) // /api/users/logout
    .then(res => {
        if (res.data.status === "done"){
            console.log("done");
            history.push("/");
        }
    })
    .catch(err => console.error(err));
}

const CategoriesJSX = () => {
    return (
        [
        chatRoomList.map(category => <li className="category">
            <a href="#">{category}</a>
            <EditSVG />
        </li>),
        <br />,
        voiceChatList.map(category => <li className="category">
            <a href="#">{category}</a>
            <EditSVG />
        </li>)
        ]
    )
};

const Categories = ({user}) => (
    <div className="categories">
        <div className="topbar">
            <h1 className="user">{user}</h1>
            <img src={plusIcon} alt="plusIcon" className="plusIcon" onClick={addCategory} />
        </div>

        <nav>
            <ul>
                <CategoriesJSX />
            </ul>
        </nav>
    </div>
)

const Messages = ({category, placeholder, history}) => (
    <div className="messages">
        <div id="top">
            <h1 id="category">{category}</h1>
            <h1 className="log_out" onClick={(event) => {logOut(event, history)}}>Log out</h1>
        </div>

        <div id="chat-screen">
            <div className="mmm">
                <h4 className="author">author</h4>
                <h4 className="message">message</h4>
                <h4 className="date">date</h4>
            </div>
        </div>

        <div id="input">
            <textarea
                id="text-area"
                type="text"
                name="text-input"
                placeholder={placeholder}
                rows="10"
                cols="30"
                // onChange={}
            ></textarea>
            <svg width="24" height="24" viewBox="0 0 24 24" onClick={(event) => appendFile(event)}>
                <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z">
                </path>
            </svg>
        </div>
    </div>
)

const StatusBar = () => (
    <div className="status-bar"></div>
)

const Chat = () => {
    let { id, category } = useParams();

    const [username, setusername] = useState("gio");
    const [placeholder, setPlaceholder] = useState(`Message #${category}`); // .decode('utf-8')
    const queryParams = new URLSearchParams(window.location.search);
    const history = useHistory();

    useEffect(() => {
        console.log(queryParams.get('id'));
        if (queryParams.get('room') !== null){ // successfully registered
            // pass
        }
        else {
            category = "room #1";
        }
        getBasicData(setusername, history, "chat");
    }, []);

    return (
        <div className="chat">
            <Categories user={username} />
            <Messages category={category} placeholder={placeholder} history={history} />
            <StatusBar />
        </div>
    );
}

export default Chat;
import axios from 'axios';

const loadMessages = (messages) => {}

const getBasicData = (setUserName, history, frame="none") => {
    axios.post('/api/users/status', { junk: "" })
    .then(res => {
        if (res.data.status === "1"){
            if (frame != "chat")
                history.push('/chat/room1');

            setUserName(res.data.username);
            loadMessages(res.data.messages);
        }
        else if (history.location.search !== "signup") {
            history.push('/');
        }
    })
    .catch(err => console.error(err));
}

export { getBasicData };
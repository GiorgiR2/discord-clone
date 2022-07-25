import axios from 'axios';

const getBasicData = (history, setUserName, setAuthentication, setCatJson, frame="none") => {
    axios.post('/api/users/status', { junk: "" })
    .then(res => {
        if (res.data.status === "1"){
            if (frame !== "chat")
                history.push('/chat/');
            else if (setAuthentication){
                let username = res.data.username;
                setAuthentication(res.data.authentication);
                setUserName(username);
                setCatJson(res.data.categories);
            }
        }
        else if (history.location.pathname !== "/signup"){
            history.push('/');
        }
    })
    .catch(err => {
        console.error("f error", err);
        // history.push('/');
    });
}

export { getBasicData };
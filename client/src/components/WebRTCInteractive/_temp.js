const setUpFirstUser = (answer, roomName) => {
    const lc = new RTCPeerConnection(); // local connection

    const dc = lc.createDataChannel(roomName); // data channel

    dc.onmessage = e => console.log("new message", e.data);
    dc.onopen = e => console.log("connection opened...");

    lc.onicecandidate = e => {
        offer = lc.localDescription;
        console.log("New Ice Candidate! reprinting SDP", JSON.stringify(offer));
    };

    lc.createOffer().then(o => lc.setLocalDescription(o)); // data for remote client

    lc.setRemoteDescription(answer);
}

const connectTo = (offer) => {
    const rc = new RTCPeerConnection(); // remote connection

    rc.onicecandidate = e => {
        answer = rc.localDescription;
        console.log("New Ice Candidate! reprinting SDP", JSON.stringify(answer));
    };

    rc.ondatachannel = e => {
        rc.dc = e.channel; // data channel
        rc.dc.onmessage = e => console.log("new message", e.data);
        rc.onopen = e => console.log("connection opened...");
    };

    rc.setRemoteDescription(offer)
    .then(a => console.log("offer set"));

    rc.createAnswer()
    .then(a => rc.setLocalDescription(a))
    .then(a => console.log("answer created"));
}
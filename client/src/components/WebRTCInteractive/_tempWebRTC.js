const WebRTC = () => {
    // first part
    const lc = new RTCPeerConnection(); // local connection
    const dc = lc.createDataChannel("channel"); // data channel

    dc.onmessage = e => console.log("new message", e.data);
    dc.onopen = e => console.log("connection opened...");

    lc.onicecandidate = e => console.log("New Ice Candidate! reprinting SDP",
    JSON.stringify(lc.localDescription));

    const offer = lc.createOffer().then(o => lc.setLocalDescription(o)); // data for remote client

    const answer = {}

    lc.setRemoteDescription(answer);
    // lc.addTrack(stream);
    // .getTracks()

    dc.send("hey");

    // second part
    const offer = {};
    const rc = new RTCPeerConnection(); // remote connection
    rc.onicecandidate = e => console.log("New Ice Candidate! reprinting SDP",
    JSON.stringify(rc.localDescription));

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

    rc.dc.send("hi");
}
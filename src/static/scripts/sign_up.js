function send_data() {
    var username = document.getElementById("username").value;
    var password0 = document.getElementById("password0").value;
    var password1 = document.getElementById("password1").value;
    
    if (password0 == password1 && username != "") {

        socket.emit( 'siggnn', {
            user_name: username,
            password: password0
        })

        socket.on( 'nt_available', function( msg ) {
            alert("UserName not available...");
        })

        socket.on('redirect', function (data) {
            console.log(data);
            window.location = data.url;
        })
    }
    else {
        alert("Passwords didn't match..");
    }
}

var socket = io.connect('http://' + document.domain + ':' + location.port);

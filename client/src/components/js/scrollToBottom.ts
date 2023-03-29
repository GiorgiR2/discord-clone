
const scrollToBottom = () => {
    // scroll to the latest message
    try {
        let el: any = document.getElementById("last-element");
        el.scrollIntoView();
    } catch {
        //pass
    }
}

export default scrollToBottom;
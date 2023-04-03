
const scrollToBottom = () => {
    // scroll to the latest message
    try {
        let el: any = document.getElementById("last-element");
        setTimeout(() => {
            el.scrollIntoView();
        }, 200);
    } catch {
        //pass
    }
}

export default scrollToBottom;
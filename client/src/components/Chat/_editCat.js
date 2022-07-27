import React, { useRef } from "react";

import axios from "axios";

import "./_editCat.sass";

const PopupEditCat = ({ setDisplay, catjson, setCatJson, elementId }) => {
    const newNameRef = useRef();

    return(
        <div className="popup">
            <div className="center">
                <h4 className="label">New Name:</h4>
                <input rows="1" columns="20" ref={newNameRef}/>

                <div className="buttons">
                    <h4 className="cancel" onClick={() => setDisplay(false)}>
                        CANCEL
                    </h4>
                    <h4 className="go" onClick={(event) =>
                        sendEditCommand(event, elementId, catjson, setCatJson, newNameRef.current.value, setDisplay)}>
                        GO
                    </h4>
                </div>
            </div>
        </div>
    );
}

const PopupAddCat = ({ setDisplay, catjson, setCatJson }) => {
    const newNameRef = useRef();

    return(
        <div className="popup">
            <div className="center">
                <h4 className="label">Add Category:</h4>

                <input rows="1" columns="20" ref={newNameRef} placeholder='not supported' disabled/>

                <div className="buttons">
                    <h4 className="cancel" onClick={() => setDisplay(false)}>
                        CANCEL
                    </h4>
                    <h4 className="go" onClick={(event) => sendAddCommand(event, catjson, setCatJson, newNameRef.current.value)}>
                        GO
                    </h4>
                </div>
            </div>
        </div>
    );
}

const sendEditCommand = (event, elementId, catJson, setCatJson, newName, setDisplay) => {
    // console.log("newName =", newName);
    // console.log("id =", elementId);
    // console.log(catJson);
    if (newName != ""){
        axios.post("/api/editCat", { catId: elementId, newCatName: newName })
        .then(res => {
            if (res.data.status === "done"){
                // update category name

                setDisplay(false);
                let newJson = catJson.map(cat => {
                    if (cat._id === elementId){
                        return {
                            name: newName,
                            position: cat.position,
                            voice: cat.voice,
                            __v: cat.__v,
                            _id: cat._id
                        };
                    }
                    else
                        return cat;
                });

                setCatJson(newJson);
            }
            else if (res.data.status === "try again"){
                alert("try again...");
            }
        })
        .catch(err => console.error(err));
    }
}

const sendAddCommand = (event, catJson, setCatJson, newName) => {
    // console.log("newName =", newName);
    // console.log(catJson);
    if (newName !== ""){
        alert("function not available...");
        // axios.post("/api/addCat", { newCatName: newName })
        // .then(res => {
        //     if (res.data.status === "done"){
        //         // add cat
        //         let newJson = [...catJson, ];

        //         setCatJson(newJson);
        //     }
        //     else if (res.data.status === "try again"){
        //         alert("try again...");
        //     }
        // })
        // .catch(err => console.error(err));
    }
}

const editCat = (event, id, display, setDisplay, setElementId) => {
    event.preventDefault();
    setDisplay(true);
    setElementId(id);

    // console.log("id", id, display);
}

export {
    PopupEditCat, PopupAddCat, editCat,
};
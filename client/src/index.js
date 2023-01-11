import React from "react";
import ReactDOM from "react-dom";

import App from "./App.js";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import userReducer from "./features/users";
import interfaceReducer from "./features/interface";
import voiceReducer from "./features/voice";

const store = configureStore({
  reducer: {
    users: userReducer,
    interfaces: interfaceReducer,
    voice: voiceReducer,
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

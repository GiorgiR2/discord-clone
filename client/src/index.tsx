import ReactDOM from "react-dom/client";
import App from "./App";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import interfaceReducer from "./features/interfaces";
import toggleReducer from "./features/toggle";
import voiceReducer from "./features/voice";

const store = configureStore({
  reducer: {
    interfaces: interfaceReducer,
    toggle: toggleReducer,
    voice: voiceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// <React.StrictMode></React.StrictMode>
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

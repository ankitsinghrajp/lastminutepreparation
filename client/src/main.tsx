import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { store, persistor } from "./redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
       <HelmetProvider>
      <App />
       </HelmetProvider>
    </PersistGate>
  </Provider>
);
import React, { useState } from "react";
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Users from "./views/Users";
import SignIn from "./views/SignIn";
import ResponsiveDrawer from "./components/ResponsiveDrawer";
import { ThemeProvider,  makeStyles } from '@material-ui/core/styles';
import PPA from "./views/PPA";
import Bill from "./views/Bill";
import Meter from "./views/Meter";

function App() {
  
  const useStyles = makeStyles({
    container: {
      display: "flex"
    }
  });
  const classes = useStyles();
  return (
    <div>
        <React.Fragment>
          <BrowserRouter>
            {/* <Home/> */}
              <Routes>
                <Route path="/" element={<Navigate to={"/login"} />} />
                <Route path="/login" element={<SignIn />} />
                <Route path="/login/:sessionexpired" element={<SignIn />} />
                <Route path="/users/" element={<Users />} />
                <Route path="/ppa/" element={<PPA />} />
                <Route path="/bill/" element={<Bill />} />
                <Route path="/meter/" element={<Meter />} />
              </Routes>
          </BrowserRouter>
      </React.Fragment>
    </div>
  );
}

export default App;

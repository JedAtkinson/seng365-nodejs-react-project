import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Films from "./components/Films";
import Film from "./components/Film";
import MyFilms from "./components/MyFilms";
import MyProfile from "./components/MyProfile";

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
              <Route index element={<Home />} />
              <Route path="/myFilms" element={<MyFilms />} />
              <Route path="/myProfile" element={<MyProfile />} />
              <Route path="/films" element={<Films />} />
              <Route path="/film/:id" element={<Film />} />
              <Route path="*" element={<NotFound/>} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;

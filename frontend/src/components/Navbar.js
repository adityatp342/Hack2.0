import React, { useEffect, useState, useContext } from "react";
import "../css/Navbar.css";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { useNavigate } from "react-router-dom";

import {
  exploreOutline,
  exploreFill,
  homeFill,
  homeOutline,
  likeFillBlack,
  likeFillRed,
  likeOutline,
  messageFill,
  messageOutline,
  createPostOutline,
  createPostFill,
  searchBarIcon,
  searchIconFill,
  searchIconOutline,
} from "./SvgIcons";


export default function Navbar({ login }) {
  const navigate = useNavigate();
  const { setModalOpen } = useContext(LoginContext);
  const { setVolModalOpen } = useContext(LoginContext);
  const location = useLocation();
  const [onHome, setOnHome] = useState(false);
  const [onRequest, setOnRequest] = useState(false);
  const [isVol, setVol] = useState(false)
  const [onLike, setOnLike] = useState(false);


  useEffect(() => {
    setOnHome(location.pathname === "/");
    
    setOnLike(location.pathname === "/request");
    // setOnChat(location.pathname === "/messenger");
    // setOnCreatePost(location.pathname === "/createPost");
    // setOnExplore(location.pathname === "/followingpost");
    // setOnLike(location.pathname === "/notifications");

  }, [location]);

  const loginStatus = () => {
    const token = localStorage.getItem("jwt");
    if (login || token) {
      return [
        <>
        <NavLink to="/Donatepage">
            <li>
              
              Donate
            </li>
          </NavLink>

          <NavLink to="/request">
            <li>
            <span >
                {onLike ? likeFillBlack : likeOutline}
              </span>
            Request
            </li>
          </NavLink>

          <NavLink to="/volunteer">
            <li onClick={() =>{



                  fetch(`http://localhost:5000/update_volunteer/${JSON.parse(localStorage.getItem("user"))._id}`, {
                    method: "put",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      is_vol: true
              
                    })
                  }).then(res => res.json())
                    .then(data => {
                     
                      console.log(data)
                    })
            }} >
              
            Volunteer
            </li>
          </NavLink>

          <Link to="/">
            <li onClick={() => setModalOpen(true)}>
            
              Log Out
            </li>
          </Link>
         
          
        </>,
      ];
    } else {
      return [<></>];
    }
  };



  const token = localStorage.getItem("jwt");
  if (login || token) {
    return [
      <>
        <div className="navbar">
          <div className="one">
            
          </div>
          <div className="two">
            <ul className="nav-menu">{loginStatus()}</ul>
          </div>
        </div>
       
      </>,
    ];
  } else {
    return [<></>];
  }
}

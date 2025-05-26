import React from 'react';
import "./App.css";
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from "./pages/home/Home";
import Header from "./components/header/Header.jsx"
import Footer from './components/footer/Footer.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Verify from './pages/auth/Verify.jsx';
import About from './pages/about/About.jsx';
import { UserData } from './context/UserContext.jsx';
import Account from './pages/account/Account.jsx';
import Courses from './pages/courses/Courses.jsx';
import CourseDescription from './pages/coursedescription/CourseDescription.jsx';
const App = () => {
  const {isAuth,user}=UserData();
  return ( <>
  <BrowserRouter>
  <Header isAuth={isAuth}/>
  <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/about" element={<About/>} />
    <Route path="/courses" element={<Courses/>} />
    <Route path="/account" element={isAuth?<Account user={user}/>:<Login/>} />
    <Route path="/login" element={isAuth?<Home/>:<Login/>} />
    <Route path ="/register" element={isAuth?<Home/>:<Register/>}/>
    <Route path ="/verify" element={isAuth?<Home/>:<Verify/>}/>
    <Route path="/course/:id" element={isAuth?<CourseDescription/>:<Login/>}/>
  </Routes>
  <Footer/>
  </BrowserRouter>
  </>
  )
}

export default App
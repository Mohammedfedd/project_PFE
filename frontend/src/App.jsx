import React, { useState } from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/home/Home";
import Header from "./components/header/Header.jsx";
import Footer from './components/footer/Footer.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Verify from './pages/auth/Verify.jsx';
import About from './pages/about/About.jsx';
import { UserData } from './context/UserContext.jsx';
import Account from './pages/account/Account.jsx';
import Courses from './pages/courses/Courses.jsx';
import PaymentSuccess from './pages/paymentsuccess/Paymentsuccess.jsx';
import CourseDescription from './pages/coursedescription/CourseDescription.jsx';
import PaymentCanceled from './pages/paymentcanceled/PaymentCanceled.jsx';
import Loading from './components/loading/Loading.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';

const App = () => {
  const { isAuth, user, loading: authLoading } = UserData();
  const [pageLoading, setPageLoading] = useState(false);

  // Show loading while auth loading or page loading
  if (authLoading || pageLoading) return <Loading />;

  return (
    <BrowserRouter>
      <Header isAuth={isAuth} />
      <Routes>
        <Route path="/" element={<Home setPageLoading={setPageLoading} />} />
        <Route path="/about" element={<About setPageLoading={setPageLoading} />} />
        <Route path="/courses" element={<Courses setPageLoading={setPageLoading} />} />
        <Route path="/account" element={isAuth ? <Account user={user} setPageLoading={setPageLoading} /> : <Login setPageLoading={setPageLoading} />} />
        <Route path="/login" element={isAuth ? <Home setPageLoading={setPageLoading} /> : <Login setPageLoading={setPageLoading} />} />
        <Route path="/register" element={isAuth ? <Home setPageLoading={setPageLoading} /> : <Register setPageLoading={setPageLoading} />} />
        <Route path="/verify" element={isAuth ? <Home setPageLoading={setPageLoading} /> : <Verify setPageLoading={setPageLoading} />} />
        <Route path="/course/:id" element={isAuth ? <CourseDescription setPageLoading={setPageLoading} /> : <Login setPageLoading={setPageLoading} />} />
        <Route path="/payment-success" element={<PaymentSuccess setPageLoading={setPageLoading} />} />
        <Route path="/payment-cancel" element={<PaymentCanceled setPageLoading={setPageLoading} />} />
        <Route path="/:id/dashboard" element={<Dashboard user={user} setPageLoading={setPageLoading} />} />

      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;

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
import RefundCourse from './pages/refundcourse/RefundCourse.jsx';
import EditUser from './pages/edituser/EditUser.jsx';
import Lecture from './pages/lecture/Lecture.jsx';
import CourseStudy from './pages/CourseStudy/CourseStudy.jsx';
import AdminDashboard from './admin/Dashboard/AdminDashboard.jsx';
import AdminCourses from './admin/Courses/AdminCourses.jsx';
import AdminUsers from './admin/Users/AdminUsers.jsx';
import AdminCategory from './admin/Category/AdminCategory.jsx';
import AdminSales from './admin/Sales/AdminSales.jsx';
import AdminEducator from './admin/Educators/AdminEducators.jsx';
import Educators from './pages/educators/Educators.jsx';


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
        <Route path="/educators" element={<Educators setPageLoading={setPageLoading} />} />
        <Route path="/courses" element={<Courses user={user} setPageLoading={setPageLoading} />} />
        <Route path="/account" element={isAuth ? <Account user={user} setPageLoading={setPageLoading} /> : <Login setPageLoading={setPageLoading} />} />
        <Route path="/login" element={isAuth ? <Home setPageLoading={setPageLoading} /> : <Login setPageLoading={setPageLoading} />} />
        <Route path="/register" element={isAuth ? <Home setPageLoading={setPageLoading} /> : <Register setPageLoading={setPageLoading} />} />
        <Route path="/verify" element={isAuth ? <Home setPageLoading={setPageLoading} /> : <Verify setPageLoading={setPageLoading} />} />
        <Route path="/course/:id" element={isAuth ? <CourseDescription setPageLoading={setPageLoading} /> : <Login setPageLoading={setPageLoading} />} />
        <Route path="/payment-success" element={<PaymentSuccess user={user} setPageLoading={setPageLoading} />} />
        <Route path="/payment-cancel" element={<PaymentCanceled setPageLoading={setPageLoading} />} />
        <Route path="/:id/dashboard" element={<Dashboard user={user} setPageLoading={setPageLoading} />} />
        <Route path="/refund/:courseId" element={<RefundCourse user={user} />} />
        <Route path=":id/edit-profile" element={isAuth ? <EditUser user={user} /> : <Login setPageLoading={setPageLoading} />} />
        <Route path="/course/study/:id"element={isAuth ? <CourseStudy user={user} /> : <Login />} />
        <Route path="/lectures/:id" element={isAuth ? <Lecture user={user} /> : <Login />}/>
        <Route path="/admin/dashboard" element={isAuth ? <AdminDashboard user={user} /> : <Login />}/>
        <Route path="/admin/course" element={isAuth ? <AdminCourses user={user} /> : <Login />}/>
        <Route path="/admin/users" element={isAuth ? <AdminUsers user={user} /> : <Login />}/>
        <Route path="/admin/category" element={isAuth ? <AdminCategory user={user} /> : <Login />}/>
        <Route path="/admin/sales" element={isAuth ? <AdminSales user={user} /> : <Login />}/>
        <Route path="/admin/educators" element={isAuth ? <AdminEducator user={user} /> : <Login />}/>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;

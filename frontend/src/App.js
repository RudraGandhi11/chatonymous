import './index.css'
import { io } from 'socket.io-client';
import { useEffect } from 'react';
import Login from './components/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PageNotFound from './PageNotFound';

function App() {
  const socket = io("https://chatonymous-n12s.onrender.com")

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login props={socket}/>} />
        <Route path="*" element={<PageNotFound/>} />
      </Routes>
    </BrowserRouter>
   </>
  );
}

export default App;

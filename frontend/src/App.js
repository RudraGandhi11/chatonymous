import './index.css'
import { io } from 'socket.io-client';
import { useEffect } from 'react';
import Login from './components/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PageNotFound from './PageNotFound';

function App() {
  const socket = io("http://localhost:8000")

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

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import HomePage from './components/HomePage';
import EntryPage from './components/EntryPage';
import PayPalButton from './payPalButton';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<EntryPage/>}/>
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/payment' element={<PayPalButton/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

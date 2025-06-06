import React, {useState} from 'react'
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

export default function Signup() {

    const [user, setUser] = useState([]);
    const [name , setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const CreateUser = async() => {
        try {
            const response = await axios.post('http://localhost:8000/signup', 
                {name : name, email : email, password : password},
                {withCredentials : true},
            )
            setUser([...user, response.data])
                setName('')
                setEmail('');
                setPassword('')
                navigate('/login')
        } catch (error) {
            setError('Failed to Create user')
        }
    }

    const handleLogin = () => {
        navigate('/login')
    }

    const handleEntry = () => {
        navigate('/')
      }

  return (
    <div>
        <button onClick={handleEntry} style={{position:'absolute', top:'15px', right:'15px', width:'120px', height:'35px', borderRadius:'10px', border:'2px solid grey', background:'none', color:'white', fontWeight:'bold' }}>
            Leave Page 
            <i style={{marginLeft:'10px', widht:'10px', height:'10px'}} class="fa-regular fa-circle-xmark"></i></button>
        <img
        src='images/signup-img.png'
        alt='signup pic'
        style={{width:'105%', height:'100%'}}
        />
        <div
  style={{
    position: 'absolute',
    top: '70%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Center the form
    border: '2px solid white',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark background for contrast
    padding: '20px',
    paddingRight:'40px',
    width: '550px',
    height:"300",
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Soft shadow for depth
    fontFamily: 'Arial, sans-serif',
  }}
>
  <h2 style={{ color: 'white', marginBottom: '15px' }}>Welcome</h2>
  
  <input
    type='text'
    placeholder='Enter Name'
    value={name}
    onChange={(e) => setName(e.target.value)}
    style={{
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '16px',
    }}
  />
  
  <input
    type='email'
    placeholder='Enter Email'
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    style={{
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '16px',
    }}
  />
  
  <input
    type='password'
    placeholder='Enter Password'
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{
      width: '100%',
      padding: '10px',
      marginBottom: '15px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '16px',
    }}
  />
  
  <button
    onClick={CreateUser}
    style={{
      backgroundColor: '#4CAF50',
      color: '#fff',
      border: 'none',
      padding: '12px 20px',
      margin: '5px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s ease',
      width: '30%',
    }}
    onMouseEnter={(e) => (e.target.style.backgroundColor = '#45a049')}
    onMouseLeave={(e) => (e.target.style.backgroundColor = '#4CAF50')}
  >
    Signup
  </button>
  
  <div>
  <span style={{color:'white', marginRight:'20px'}}>If already a user, Please</span>
  <button
    onClick={handleLogin}
    style={{
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      padding: '12px 20px',
      margin: '10px 5px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s ease',
      width: '20%',
    }}
    onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
    onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
  >
    Login
  </button>
  </div>
</div>

        {error && <p style={{color : "red"}}>{error}</p>}
    </div>
  )
}

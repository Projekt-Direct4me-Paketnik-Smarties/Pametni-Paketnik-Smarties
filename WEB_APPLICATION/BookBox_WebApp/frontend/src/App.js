import { useState, useEffect, useContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from "./userContext.js";
import './App.css'

function App() {
  
  const [words, setWords] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("")
  const userContext = useContext(UserContext);
  const [otherWords, setOWords] = useState("")

  useEffect(() => {
    getWord();
  }, []);

  const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  }
  async function Register(e){
        e.preventDefault();
        const res = await fetch(`http://localhost:5000/users/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password
            })
        });
        const data = await res.json();
        if(res.ok){
            setOWords("Registration Sucesful")
        }
        else{
            setOWords(data.message);
        }
  }
  async function Login(e){
        e.preventDefault();
        const res = await fetch(`http://localhost:5000/users/login`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                password: password,
            }), 
            credentials: "include" 
        });
        const data = await res.json();
        console.log(data)
        if(res.ok){
            setOWords("login succeded")
            console.log(data)
            updateUserData(data);
            console.log(userContext.user)
        } else {
            setOWords(data.message);
        }
    }

  async function Logout(){
    const res = await fetch(`http://localhost:5000/users/logout`, { 
      credentials: "include" 
    });
    const data =await res.json()
    updateUserData(null);
    if(res.ok){
      setOWords("logged out successfully")
    }
    else{
      setOWords(data.message)
    }
  }
  async function DeleteUser(){
    const res = await fetch((`http://localhost:5000/users/${user? user._id: null}`), {
      method:"delete", 
      credentials: "include" });
      const data =await res.json()
    if(res.ok){
        updateUserData(null);
        setOWords("Deleted successfully");
    } else {
        const data = await res.json();
        setOWords(data.message);
    }
  }  
  async function getWord(){ 
    const res = await fetch(`http://localhost:5000/`);
    const data = await res.json();
    setWords(data.message)
  }
    
  return (
    <BrowserRouter>
    <UserContext.Provider value={{
        user: user,
        setUserContext: updateUserData
      }}>
        <div className="App">
          <p>words</p>
          <p>{userContext.user?userContext.user.username:null }</p>
          <p>{otherWords}</p>
          <form onSubmit={Login}>
              <input type="text" name="username" placeholder="Username" value={username} onChange={(e)=>(setUsername(e.target.value))}/>
              <input type="password" name="password" placeholder="Password" value={password} onChange={(e)=>(setPassword(e.target.value))}/>
              <input type="submit" name="submit" value="Log in"/>
          </form>
          <form onSubmit={Register}>
              <input type="text" name="email" placeholder="Email" value={email} onChange={(e)=>(setEmail(e.target.value))} />
              <input type="text" name="username" placeholder="Username" value={username} onChange={(e)=>(setUsername(e.target.value))}/>
              <input type="password" name="password" placeholder="Password" value={password} onChange={(e)=>(setPassword(e.target.value))} />
              <input type="submit" name="submit" value="Register" />
          </form>
          <Routes>
          </Routes>
        </div>
        <button onClick={() => console.log("User state:", user)}>Check user state</button>
        <button onClick={() => console.log("LocalStorage:", localStorage.getItem("user"))}>Check localStorage</button>
        <button onClick={() => { Logout() }}>Logout</button>
        <button onClick={() => { DeleteUser() }}>Delete user</button>
        </UserContext.Provider>
    </BrowserRouter>
  )
}

export default App

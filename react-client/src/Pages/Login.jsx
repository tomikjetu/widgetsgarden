import axios from "axios";
import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";

import "../Styles/Login/index.css"
import "../Styles/Login/mediaquery.css"

axios.defaults.withCredentials = true;

export default function Login() {
  const [register, setRegister] = useState(false);
  const navigate = useNavigate();

  return <div className="login-page">

    <div className="center" style={{position: "absolute", top: 0}}>
      <div className="row login-wrapper">
        <div className="login-design"></div>
        <div className="login-form-wrapper">
          <div className="wrapper-col">
            {register && <RegisterForm setRegister={setRegister} navigate={navigate} />}
            {!register && <LoginForm setRegister={setRegister} navigate={navigate} />}
          </div>
        </div>
      </div>

    </div>


  </div>
}


async function Request(URL, payload, setError, navigate) {
  try {
    var LoginResponse = await axios.post(`${process.env.REACT_APP_SERVER_URL}/${URL}`, payload);
    var data = LoginResponse.data;
    var [type, message] = data.split(":");
    if (type == "error") setError(message);
    else if (type == "success") navigate("/dashboard", { replace: true });
    else setError("An Error Occured, Please try again later.");
  } catch (err) {
    console.log(err);
    setError("An Error Occured, Please try again later.");
  }
}


function RegisterForm({ setRegister, navigate }) {
  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordAgainRef = useRef(null);

  const PasswordValidation = useRef(null);

  const [error, setError] = useState(null);

  function ValidateInput(event) {
    setError(null);

    var input = event.target;
    var validation = input.getAttribute('validation');

    if (!validation) return input.removeAttribute('valid');

    var result = input.value.match(validation);
    var valid = result != null;
    input.setAttribute('valid', valid);
  }

  function ValidatePassword(event) {
    var value = passwordRef.current.value;

    var count = 0;
    //LENGTH
    if (value.length < 8) PasswordValidation.current.children[0].classList.remove('satisfied');
    else { PasswordValidation.current.children[0].classList.add('satisfied'); count++ }

    //SMALL CHARACTER
    if (!value.match(/.*[a-z].*/)) PasswordValidation.current.children[1].classList.remove('satisfied');
    else { PasswordValidation.current.children[1].classList.add('satisfied'); count++ }

    //LARGE CHARACTER
    if (!value.match(/.*[A-Z].*/)) PasswordValidation.current.children[2].classList.remove('satisfied');
    else { PasswordValidation.current.children[2].classList.add('satisfied'); count++ }

    //DIGIT
    if (!value.match(/.*\d.*/)) PasswordValidation.current.children[3].classList.remove('satisfied');
    else { PasswordValidation.current.children[3].classList.add('satisfied'); count++ }

    //SPECIAL CHARACTER
    if (!value.match(/.*[ *.!@#$%^&(){}[\]:";'<>,.?\/~`_+=|\\].*/)) PasswordValidation.current.children[4].classList.remove('satisfied');
    else { PasswordValidation.current.children[4].classList.add('satisfied'); count++ }

    passwordRef.current.setAttribute("valid", count == 5);
    if (event.keyCode === 13) document.getElementById("submit").click();
  }

  function PasswordEnter() {
    PasswordValidation.current.style.display = "block";
  }

  function PasswordLeave() {
    PasswordValidation.current.style.display = "none";
  }

  function RepeatPasswordValidate() {
    var password = passwordRef.current;
    var repeat = passwordAgainRef.current;

    passwordAgainRef.current.setAttribute('valid', password.getAttribute('valid') == "true" && password.value == repeat.value)
  }

  function Validate() {
    var email = emailRef.current;
    var username = usernameRef.current;
    var password = passwordRef.current;
    var passwordAgain = passwordAgainRef.current;

    if (!email.value) email.setAttribute('valid', false);
    if (!username.value) username.setAttribute('valid', false);
    if (!password.value) password.setAttribute('valid', false);
    if (!passwordAgain.value) passwordAgain.setAttribute('valid', false);

    if (email.getAttribute('valid') == 'false' || username.getAttribute('valid') == 'false' || password.getAttribute('valid') == 'false' || passwordAgain.getAttribute('valid') == 'false') return false;
    return true;
  }

  async function RegisterRequest() {
    if (!Validate()) return;
    var email = emailRef.current.value;
    var username = usernameRef.current.value;
    var password = passwordRef.current.value;
    var passwordAgain = passwordAgainRef.current.value;

    if (password != passwordAgain) setError("Passwords don't match")
    if (!email || !password) setError("");
    Request(`auth/local/register`, { email, username, password }, setError, navigate);
  }

  return <form className="login-form">
    <h3 className="title">Register</h3>
    <input ref={emailRef} className="login-control" type="email" autoComplete="email"
      placeholder="E-mail" validation="^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$" onKeyUp={ValidateInput} />
    <input ref={usernameRef} className="login-control" type="text" autoComplete="username"
      placeholder="Name" validation="^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$" onKeyUp={ValidateInput} />
    <div className="password">
      <input ref={passwordRef} className="login-control" type="password" autoComplete="new-password"
        placeholder="Password" onFocus={PasswordEnter} onBlur={PasswordLeave} onKeyUp={ValidatePassword} />
      <div style={{ display: "none" }} ref={PasswordValidation} className="passwordValidation">
        <p>Minimum 8 characters</p>
        <p>Lowercase Character</p>
        <p>Uppercase Character</p>
        <p>Number</p>
        <p>Special character</p>
      </div>
    </div>
    <input ref={passwordAgainRef} className="login-control" type="password" autoComplete="new-password"
      placeholder="Repeat password" onKeyUp={RepeatPasswordValidate} />
    {error && <p className="login-error-message">{error}</p>}
    <button className="btn login-control" type="button" onClick={RegisterRequest}>Register</button>
    <div className="login-options">
      <p className="option" onClick={() => { setRegister(false) }}>Log In</p>
      <div className="vr"></div>
      <a className="option" href="/terms-of-service">Terms of Service</a>
    </div>
    <OtherMethods />
  </form>
}

function LoginForm({ setRegister, navigate }) {
  const [params] = useSearchParams();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [error, setError] = useState(null);
  useEffect(()=>{
    var errorParam = params.get("error");
    if(errorParam) setError(errorParam); 
  },[])

  function ValidateInput(event) {
    setError(null);

    var input = event.target;
    var validation = input.getAttribute('validation');

    if (!validation) return input.removeAttribute('valid');

    var result = input.value.match(validation);
    var valid = result != null;
    input.setAttribute('valid', valid);
  }

  function Validate() {
    var email = emailRef.current;
    var password = passwordRef.current;

    if (!email.value) email.setAttribute('valid', false);
    if (!password.value) password.setAttribute('valid', false);

    if (email.getAttribute('valid') == 'false' || password.getAttribute('valid') == 'false') return false;
    return true;
  }

  async function LoginRequest() {
    if (!Validate()) return;
    var email = emailRef.current.value;
    var password = passwordRef.current.value;

    Request(`auth/local/login`, { email, password }, setError, navigate);
  }

  return <form className="login-form">
    <h3 className="title">Login</h3>
    <input ref={emailRef} className="login-control" type="email" autoComplete="email"
      placeholder="E-mail" validation="^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$" onKeyUp={ValidateInput} />
    <input ref={passwordRef} className="login-control" type="password" autoComplete="current-password"
      placeholder="Password" onKeyUp={ValidateInput} />
    {error && <p className="login-error-message">{error}</p>}
    <button className="btn login-control" type="button" onClick={LoginRequest}>Login</button>

    <div className="login-options">
      <p className="option" onClick={() => setRegister(true)}>New account</p>
      <div className="vr"></div>
      <a className="option" href="/terms-of-service">Terms of Service</a>
    </div>

    <OtherMethods />
  </form>

}

function OtherMethods() {
  return <div className="login-methods">
    <a href={`${process.env.REACT_APP_SERVER_URL}/auth/google`}>
      <img className="login-method" src="auth/google-login.png" alt="" />
    </a>
  </div>
}
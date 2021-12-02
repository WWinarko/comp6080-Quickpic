import API from './api.js';
import {loadFeed}  from './feed.js';
import {loadLogin, loadSignup, login, signup, signout} from './auth.js';
import {loadProfile} from './user.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, isHidden} from './helpers.js';
const api = new API('http://localhost:5000');


let currToken = localStorage.getItem('token');
let modal = document.getElementById('showModal');
let modalBody = modal.querySelector('.modal-body');

console.log(currToken);

currToken === 'null' ? loadLogin() : loadFeed(currToken);

let authForm = document.getElementById('authForm');

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(isHidden('loginButton'));
    if (!isHidden('loginButton')) {        
        let {username,password} = authForm;
        login(username.value, password.value)
            .then(setToken)
            .then(loadFeed)
            .catch(err => alert(err));     
    }
    else if (! isHidden('signupButton')) {
        let {name,username,email,password,confirmPassword} = authForm;
        signup(name.value,username.value,email.value,password.value,confirmPassword.value)
            .then(setToken)
            .then(loadFeed)
            .catch(err => alert(err));
    }
})


const setToken = (token) => {
    currToken = token;
    localStorage.setItem('token', token);
    return currToken;
}

document.getElementById('signupLink').addEventListener('click', loadSignup);

document.getElementById('loginLink').addEventListener('click', loadLogin);

document.getElementById('signoutButton').addEventListener('click', () => {
    loadLogin();
    setToken(null);
});

document.getElementById('logo').addEventListener('click', () => loadFeed(currToken));

document.getElementById('profileButton').addEventListener('click', () => loadProfile(currToken))


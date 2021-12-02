import {show, hide, setOptions} from './helpers.js';
import API from './api.js';

const api = new API('http://localhost:5000');

const signupInputs =  ['name', 'email', 'password','username','confirmPassword', 'signupButton', 'login'];
const loginInputs = ['password','username', 'signup', 'loginButton'];
export const loadSignup = () => {
    loginInputs.map(input => hide(input));
    signupInputs.map(input => show(input));
}
export const loadLogin = () => {
    hide('header');
    hide('feed');
    show('authForm', 'flex');
    document.getElementById('main').className = 'flex-column justify-content-center align-items-center';
    signupInputs.map(input => hide(input));
    loginInputs.map(input => show(input));
}

export const login = (username, password) => { 
    return new Promise ((resolve, reject) => {
        let options = setOptions({
            "username": username,
            "password": password,
        })
    
        api.post('auth/login', options)
            .then(res => {
                console.log((res['token']));
                resolve(res['token']);
            })
            .catch(err => {
                reject(err);
            });
    })
}

export const signup = (name, username, email, password1, password2) => {
    return new Promise ((resolve, reject) => {
        if (password1 !== password2) {
            reject('Your passwords do not match');
        }
        let options = setOptions({
            "username": username,
            "password": password1,
            "name": name,
            'email': email,
        });
    
        api.post('auth/signup', options)
            .then(res => {
                resolve(res['token']);
            })
            .catch(err => {
                reject(err);
            });
    }); 
};

export const signout = () => {
    return new Promise ((resolve, reject) => {
        api.post('auth/signup', options)
            .then(res => {
                resolve(res['token']);
            })
            .catch(err => {
                reject(err);
            });
    }); 
};



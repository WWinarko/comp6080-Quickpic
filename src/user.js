import API from './api.js';
import {show, hide} from './helpers.js';
import {loadPost} from './feed.js';
const api = new API('http://localhost:5000');

let modal = document.getElementById('showModal');
let modalBody = modal.querySelector('.modal-body');
let buttons = [...modal.querySelectorAll('button')];
buttons.map(button => {
    button.addEventListener('click', () => {
        while (modalBody.firstChild) {
            modalBody.firstChild.remove()
        }
    })
});

let currToken, selfFollowing;

export const getUser = (token, username, id) => {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${token}`,
            },
        };
        let url;
        if(username === undefined && id === undefined) {
            url = 'user/';
        } else if (name === undefined) {
            url = 'user/?id=' + id;
        } else if (id === undefined) {
            url = 'user/?username=' + username;
        } else {
            url = `user/?username=${username}&id=${id}`
        }
        
        api.get(url, options)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
}

export const loadProfile =  (token, name, id) => {
    currToken = token;
    getUser(token).then(user => {selfFollowing = user['following']});
    hide('feed');
    show('profile','flex');
    getUser(token,name,id)
        .then(showUser)
}

export const showUser = ({name, following, posts, followed_num}) => {
    let profile = document.getElementById('profile');
    let userName = profile.getElementsByClassName('user-name')[0];
    userName.innerText = name;

    let follow = document.getElementById('following');
    follow.addEventListener('click', () => showFollowing(following));
    
    let folllowing_num = profile.querySelectorAll('.number')[0];
    folllowing_num.innerText = following.length;

    let folllower_num = profile.querySelectorAll('.number')[1];
    folllower_num.innerText = followed_num;

    let posts_num = profile.querySelectorAll('.number')[2];
    posts_num.innerText = posts.length;

    let postsContainer = document.getElementById('posts');
    let postPromises = posts.map(id => getPost(id));
    Promise.all(postPromises)
        .then(posts => posts.map(post => loadPost(post,postsContainer)));

}

const showFollowing = (following) => {
    modal.querySelector('.modal-title').innerText = 'Following';

    const userPromises = following.map(id => {
        return getUser(currToken, '', id)
    })
    Promise.all(userPromises)
        .then(users => {
            users.map(user => addFollowingUser(modalBody, user['name'], user['username']));
        })
}

const addFollowingUser = (parent, userName, username) => {
    let user = document.createElement('div');
    user.className = 'd-flex align-items-center justify-content-between';

    let name = document.createElement('p');
    name.className = 'user-name font-weight-bold';
    name.innerText = userName;
    name.addEventListener('click', () => loadProfile(currToken, username));

    let follow = createFollow(username, currToken);   

    user.append(name,follow)
    parent.appendChild(user);
}

const handleFollow = (id, username) => {
    let type = 'follow';
    if(selfFollowing.includes(id)) {
        type = 'unfollow'; 
    }
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${currToken}`,
        },
    };
    api.put(`user/${type}?username=${username}`,options)
        .catch(err => alert(err));
        
}

export const createFollow = (username, token) => {
    currToken = token;
    getUser(token).then(user => {selfFollowing = user['following']});
    let follow = document.createElement('button');
    follow.type = 'button';
    getUser(token,username).then(user => {
        console.log('user',user);
        if(selfFollowing.includes(user['id'])) {
            follow.className = 'unfollow btn btn-success';
            follow.innerText = 'Unfollow';
        }
        else {
            follow.className = 'follow btn btn-primary';
            follow.innerText = 'Follow';
        }
        follow.addEventListener('click', () => handleFollow(user['id'], username));
    })
    return follow;
}

const getPost = (id) => {
    return new Promise((resolve,reject) => {
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${currToken}`,
            },
        };
        
        api.get('post/?id='+id, options)
            .then(res => {
                console.log(res);
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
        
    })
}
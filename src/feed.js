import API from './api.js';
import {show, hide, setOptions} from './helpers.js';
import {getUser, loadProfile, createFollow} from './user.js';

const api = new API('http://localhost:5000');

let feed = document.getElementById('feed');
let blankFeed = feed.cloneNode(true);

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

let currToken, posts,selfID;

export const loadPost = (post,parent) => {
    //console.log(post);
    let firstPost = parent.firstElementChild;
    if (!firstPost.id) {
        createPost(firstPost, post);
        firstPost.id = post['id'];
    } else {
        console.log('aaa');
        let newPost = firstPost.cloneNode(true);
        newPost.id = post['id'];
        createPost(newPost, post);
        parent.appendChild(newPost);   
    }
}

export const loadFeed = (token) => {
    currToken = token;
    getUser(currToken).then(user => selfID = user['id']);

    return new Promise((resolve,reject) => {
        show('header', 'flex');
        show('feed');
        hide('authForm');
        hide('profile');

        document.getElementById('main').className = 'flex-column align-items-center';
        
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${token}`,
            },
        };
        
        api.get('user/feed', options)
            .then(res => {
                posts = res['posts'];
                //console.log(res['posts']);
                res['posts'].map(post => loadPost(post,feed));
                resolve(posts);
            })
            .catch(err => {
                reject(err);
            });
        
    })
    
}

const createPost = (post, {comments, meta : {author, description_text: desc, likes, published}, src}) => {
    // Get post date by converting epoch 
    let date = new Date(parseInt(published) *1000).toDateString();

    // Add post's author
    let name = post.querySelector('p');
    name.innerText = author;
    name.addEventListener('click', () => loadProfile(currToken, author));

    // Add post's image
    let postImage = post.querySelector('.postPicture');
    postImage.src = "data:image/jpeg;base64," + src;
    postImage.alt = `Post from ${name} at ${date}`;

    // Add post's caption
    let caption = post.querySelector('.caption');
    caption.innerText = desc;

    // Add posted time
    let time = post.querySelector('.time');
    time.innerText = `Posted on ${date}`;

    // Add like icon and no of likes
    let likeIcon = post.querySelector('.like');
    likeIcon.src = getLikeIcon(likes);
    likeIcon.addEventListener('click', () => handleLike(likeIcon,likes));
    let numLikes = post.querySelector('button');
    numLikes.innerText = likes.length + ' likes';
    numLikes.addEventListener('click', () => showLikes(likes));

    // Add no of comments
    let commentIcon = post.querySelector('.comment');
    let numComments = post.querySelectorAll('button')[1];
    numComments.innerText = comments.length + ' comments';
    [commentIcon, numComments].map(button => button.addEventListener('click', () => showComment(comments)));

}

const handleLike = (icon,likes) => {
    
    let postID = icon.parentNode.parentNode.id;
    let url;
    if (likes.includes(selfID)) {
        url = `post/unlike?id=${postID}`;
        icon.src = './assets/like.svg';
    } else {
        url = `post/like?id=${postID}`;
        icon.src = './assets/liked.svg';
    } 
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${currToken}`,
        },
    };
    api.put(url, options)
        .catch(err => {
            reject(err);
        });
} 

const getLikeIcon = (likes) => {
    return likes.includes(selfID) ? './assets/liked.svg' : './assets/like.svg';
}

const showLikes = (likes) => {
    //console.log(likes);
    modal.querySelector('.modal-title').innerText = 'Likes';

    const userPromises = likes.map(id => {
        return getUser(currToken, '', id)
    })
    Promise.all(userPromises)
        .then(users => {
            users.map(user => addLikedUser(modalBody, user['name'], user['id']));
        })
}

const showComment = (comments) => {
    //console.log(comments);
    modal.querySelector('.modal-title').innerText = 'Comments';
    comments.map(comment => addCommentedUser(modalBody, comment));
}

const addLikedUser = (parent, text) => {
    let user = document.createElement('div');
    user.className = 'd-flex align-items-center justify-content-between';

    let name = document.createElement('p');
    name.className = 'user-name font-weight-bold';
    name.innerText = text;
    name.addEventListener('click', () => loadProfile(currToken, text));

    let follow = createFollow(text, currToken);

    user.append(name,follow)
    parent.appendChild(user);
}

const addCommentedUser = (parent, {author, comment, published}) => {
    let user = document.createElement('div');
    user.className = 'd-flex align-items-center justify-content-between';

    let name = document.createElement('p');
    name.className = 'user-name';
    name.innerText = author + ': ' + comment;
    name.addEventListener('click', () => loadProfile(currToken, author));

    let date = new Date(parseInt(published) *1000).toDateString();
    let time = document.createElement('p');
    time.className = 'time';
    time.innerText = `Posted on ${date}`;
    
    user.append(name, time);
    parent.appendChild(user);

}
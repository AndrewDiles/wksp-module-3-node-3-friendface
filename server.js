'use strict'
const express = require('express');
const morgan = require('morgan');
const {users} = require('./data/users')
const PORT = process.env.PORT || 8000;
let currentUser = null;
let faceviewing = null;
let nonfriends = [];
    const handleHome = (req, res) => {
        if (!currentUser) {res.redirect('/signin'); return;}
        res.render('../pages/home', {
            user: currentUser,
            title: `Welcome to your home page, ${currentUser}!`,
            users: users,
        });
    }
    const handleSignin = (req, res) => {
        if  (currentUser) {res.redirect(`/user/${currentUser}`); return; }
        res.render('../pages/signin', {
            title: "Sign in to FriendFace",
            input: "Input your first name here!"
        });
    }
    const handleFailedSignin = (req, res) => {
        if  (currentUser) {res.redirect(`/user/${currentUser}`); return; }
        res.render('../pages/signin', {
            title: "Sign in to FriendFace",
            input: "Try again :)"
        });
    }
    const handleUser = (req, res) => {
        if (!currentUser) { console.log(currentUser);
            res.redirect('/signinfailed'); return;}
        const number = req.params.number;
        faceviewing = users.find(user => user.id ===number);
        res.render('../pages/anotherFace', {
            faceviewing : faceviewing,
            users: users,
            user: currentUser,
            title: "Friend or potential-friend"
        });        
    }
    const handleName = (req, res) => {
        const firstName = req.query.firstName;
        currentUser = users.find(user => user.name ===firstName);
        console.log(firstName);
        res.redirect(`${currentUser ? '/' : '/signinfailed'}`);
    }
    const handleAddition = (req, res) => {
        if (!currentUser) {res.redirect('/signin'); return;}
        const id = req.query.id;
        users.forEach((user)=> {
            if (currentUser === user) {user.friends.push(id);}
            if (id == user.id) {user.friends.push(currentUser.id);}
        })
        // currentUser.friends.push(id);
        res.redirect(`${currentUser ? '/' : '/signinfailed'}`);
    }
    const handleViewOthers = (req, res) => {
        if (!currentUser) {res.redirect('/signin'); return;}
        nonfriends = [];
        users.forEach((user) => {
            let isfriend = false;
            currentUser.friends.forEach((id) => {
                console.log(id);
                if (id === user.id || user.id === currentUser.id) {
                    console.log(`${user} is a friend`);
                    isfriend = true;
                }
            })
            if (isfriend === false) {
                console.log(`${user} is not a friend`);
                nonfriends.push(user);
            }
        })
        res.render('../pages/potentialfriends', {
            users: users,
            user: currentUser,
            title: "Potential friends",
            nonfriends: nonfriends
        }); 
    }
    
express()
    .use(morgan('dev'))
    .use(express.static('public'))
    .use(express.urlencoded({extended: false}))
    .set('view engine', 'ejs')
    // endpoints
    .get('/', handleHome)
    .get('/signinfailed', handleFailedSignin)
    .get('/signin', handleSignin)
    .get('/user/:number', handleUser)
    .get('/getname', handleName)
    .get('/getfriend', handleAddition)
    .get('/potentialfriends', handleViewOthers)
    .get('*', (req, res) => {
        res.status(404);
        res.render('pages/fourOhFour', {
            title: 'I got nothing',
            path: req.originalUrl
        });
    })
    .listen(PORT, () => console.log(`Listening on port ${PORT}`));
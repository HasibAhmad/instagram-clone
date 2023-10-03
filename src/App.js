import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import { Avatar, Button, Input, Menu, MenuItem } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircleTwoTone';
import LockIcon from '@material-ui/icons/LockTwoTone';

import './App.css';
import Post from './Post';
import { auth, db, storage } from './firebase';
import ImageUpload from './ImageUpload';
import Settings from './Settings';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  
  const [openSignIn, setOpenSignIn] = useState(false)
  const [posts, setPosts] = useState([])
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [image, setImage] = useState(null)
  const [user, setUser] = useState(null);
  const [userImageUrl, setUserImageUrl] = useState('');
  const [disableBackdropClick, setDisableBackdropClick] = useState(false);
  const [disableEscapeKeyDown, setDisableEscapeKeyDown] = useState(false);
  const [userAvatarMenuOpen, setUserAvatarMenuOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [userUId, setUserUId] = useState(null);
  
  const userAvatarRef = React.useRef()

  let userData;


  let fileInput = React.createRef();

  useEffect(() => {
    setUserAvatarMenuOpen(false)
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        //user has logged in
        setUser(authUser)
        setUserUId(authUser.uid)
        
        //userImageurl
        let usersRef = db.collection("users")
              usersRef.where("uid", "==", authUser.uid).get()
                      .then(querySnapshot => {
                              querySnapshot.forEach(doc => {
                                setUserImageUrl(doc.data().imageUrl)
                              })
                            })
      } else {
        //user has logged out
        setUser(null);
      }
    })

    return () => {
      //perform some cleanup functions before refiring the useEffect.
      unsubscribe();
    }
  }, [user, username])

  useEffect(() => {
    user && db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data()
      })));
    })
  }, [user]);

  const signUp = (event) => {
    event.preventDefault();
    
    setDisableBackdropClick(true)
    setDisableEscapeKeyDown(true)

    auth.createUserWithEmailAndPassword(email, password)
    .then((authUser) => {
      userData = authUser.user

      //upload user profile photo
      if (image !== null) {
        const uploadTask = storage.ref(`usersphoto/${userData.uid}/${image.name}`).put(image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            //progress function
          },
          (error) => {
            alert(error.message)
          },
          () => {
            //completes the funciton
            //get url of the uploaded file
            storage
              .ref(`usersphoto/${userData.uid}`)
              .child(image.name)
              .getDownloadURL()
              .then(url => {
                //post user's image to db
                db.collection("users").add({
                  uid: userData.uid,
                  username: userData.displayName,
                  imageUrl: url,
                })
                setUserImageUrl(url)
              })
              .then(
                alert('sign up completed.')
              )
              .then(
                setOpen(false),
                setUsername(''),
                setEmail(''),
                setPassword(''),
                setImage(null),
                setDisableBackdropClick(false),
                setDisableEscapeKeyDown(false),
              )
          },
        )
      }
      
      return authUser.user.updateProfile({
        displayName: username,
        photoURL: userImageUrl
      })
    })
    .catch((error) => alert(error.message))
  }

  const signIn = (event) => {
    event.preventDefault();
    
    setDisableBackdropClick(true)
    setDisableEscapeKeyDown(true)

    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => alert(error.message))
        .then(
              setOpenSignIn(false),
              setEmail(''),
              setPassword(''),
              setDisableBackdropClick(false),
              setDisableEscapeKeyDown(false),
        )    
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleUserAvatarMenuClick = () => {
    setUserAvatarMenuOpen(true)
  };

  const handleUserAvatarMenuClose = () => {
    // setAnchorEl(null);
    setUserAvatarMenuOpen(false)

  };

  const handleSettingClickOpen = () => {
    setSettingsDialogOpen(true)
  }

  const handleSettingClickClose = (data) => {
    setSettingsDialogOpen(false)
  }

  return (
    <div className="app">
      <Modal
        open={open}
        onClose={() => { setOpen(false)}}
        disableBackdropClick={disableBackdropClick}
        disableEscapeKeyDown={disableEscapeKeyDown}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img 
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="instagram_logo"
                />
            </center>
            <Input
              placeholder="Enter your username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              />
            <Input
              placeholder="Enter your email address"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              />
            <Input
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              />
            
            <div className="app__fileInput">
              {/* <InputLabel >Profile Picture: </InputLabel> */}
              <input name="fileInput" ref={fileInput} type="file"  onChange={handleFileChange} />
              <Button className="app__fileInputButton" onClick={() => { fileInput.current.click() }}>Upload profile photo</Button>
            </div>

            <Button type="submit" onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => { setOpenSignIn(false)}}
        disableBackdropClick={disableBackdropClick}
        disableEscapeKeyDown={disableEscapeKeyDown}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img 
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="oops"
                />
            </center>
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              />
            <Button type="submit" onClick={signIn}>Sign In</Button>
          </form>
        </div>
      </Modal>

      <div className="app__header">
        <img
          className="app__headerImage"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt=""
        />

      {/* signIn/Out header */}
      { user ? (
        <div className="app__register">
          <Avatar 
            className="post__avatar"
            alt={username}
            ref={userAvatarRef}
            src= {userImageUrl}
            onClick={handleUserAvatarMenuClick}
          />

          <Menu
            id="simple-menu"
            anchorEl={userAvatarRef.current}
            keepMounted
            open={userAvatarMenuOpen}
            onClose={handleUserAvatarMenuClose}
          >
            <MenuItem onClick={handleUserAvatarMenuClose}>
              <div className="app__settingsMenuItem" onClick={handleSettingClickOpen}>
                <AccountCircleIcon className="app__userAvatarIcons" fontSize="small"/>
                <p> Profile </p>
                {/* <Settings settingsDialogOpen={settingsDialogOpen} user={user}/> */}
              </div>
            </MenuItem>
            <MenuItem onClick={() => { auth.signOut() }}>
              <LockIcon className="app__userAvatarIcons" fontSize="small"/>
              Logout
            </MenuItem>
          </Menu>
        </div>
      ) : (
        <div className="app__loginContainer">
          <Button onClick={() => { setOpenSignIn(true)}}>Sign In</Button>
          <Button onClick={() => { setOpen(true)}}>Sign Up</Button>
        </div>
      )}
      </div> 
      <Settings settingsDialogOpen={settingsDialogOpen} handleSettingClickClose={handleSettingClickClose} user={user} userUID={userUId} />
      
      <div className="app__posts">

        <div className="app__postsLeft">
          { user? (
              posts.map(({id, post}) => {
                
                return (
                  <Post key={id} postId={id} user={user} userUId={post.userUId} username={post.username} imageUrl={post.imageUrl} caption={post.caption}/>
                  )
                })
            ): (
              <div className="app__noConnection">Please sign in or sign up to see photos and videos...</div>
            )
          }
        </div>
      </div>

      {
        user && <ImageUpload userUId={user.uid} username={ user.displayName }/>
      }
    </div>
  );
}

export default App;

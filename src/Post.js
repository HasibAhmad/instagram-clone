import React, { useState, useEffect } from 'react'
import Avatar from "@material-ui/core/Avatar"
import MoreVertIcon from '@material-ui/icons/MoreVert';
import firebase from 'firebase'
import { IconButton, Menu, MenuItem } from '@material-ui/core';

import "./Post.css";
import { db } from './firebase'

function Post({ postId, user, userUId, username, imageUrl, caption }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [hidePostMenu, setHidePostMenu] = useState('');
  const [userImageUrl, setUserImageUrl] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    let unsubscribe;

    // firebase.auth().onAuthStateChanged((user) => {
    //   const image = firebase.storage().ref(`usersphoto/${user.uid}`);
    //   image.getDownloadURL().then((url) => setUserProfileImage(url));
    // });

    let usersRef = db.collection("users")
    usersRef.where("uid", "==", userUId).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          setUserImageUrl(doc.data().imageUrl)
        })
      })

    if (postId) {
      unsubscribe = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => {
            return {
              id: doc.id,
              data: doc.data()
            }
          }))
        })
    }

    if (user.uid!==userUId) {
      setHidePostMenu(true);
    } else {
      setHidePostMenu(false);
    }
    
    return () => {
      unsubscribe()
    }
  }, [postId, userUId])

  const postComment = (event) => {
    event.preventDefault()
    db.collection("posts").doc(postId).collection("comments").add({
      text: comment,
      username: user.displayName,
      userImageUrl: userImageUrl,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    setComment('');
  }

  const handleDeletePost = () => {
    //delete
    db.collection("posts").doc(postId).delete()
    handleClose()
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="post">
      <div className="post__header">

        <div className="post__userAvatar">
          <Avatar
            className="post__avatar"
            alt={username}
            src={userImageUrl}
          />
          <h3>{username}</h3>
        </div>

        <div className="post__MoreVertIcon" hidden={hidePostMenu}>
          <IconButton className="post__IconButton" onClick={handleClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </div>

        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem disabled={user.uid!==userUId} onClick={handleDeletePost}>Delete post</MenuItem>
        </Menu>

      </div>

      <img
        className="post__image"
        src={imageUrl}
        alt="woops!"
      />

      <h4 className="post__text"><strong>{username} </strong>{caption}</h4>

      <div className="post__comments">
        {
          comments.map((comment) => (
            <p key={comment.id}>
              <strong>{comment.data.username}</strong> {comment.data.text}
            </p>
          ))
        }
      </div>

      {user && (
        <form className="post__commentBox">
          <input
            className="post__input"
            type="text"
            value={comment}
            placeholder="Add a comment..."
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="post__button"
            type="submit"
            disabled={!comment}
            onClick={postComment}
          >Post</button>
        </form>
      )}
    </div>
  )
}

export default Post

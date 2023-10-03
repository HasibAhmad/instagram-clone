import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import firebase from 'firebase'

import { db, storage } from './firebase'
import './ImageUpload.css'

function ImageUpload({ userUId, username }) {
  const [caption, setCaption] = useState('')
  const [progress, setProgress] = useState(0)
  const [image, setImage] = useState(null)
  let fileInput = React.createRef();

  
  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleUpload = () => {
    //uploads the file/image to firebase storage
    const uploadTask = storage.ref(`images/${image.name}`).put(image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        //progress function
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        setProgress(progress)
      },
      (error) => {
        alert(error.message)
      },
      () => {
        //completes the funciton
        //get url of the uploaded file
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then(url => {
            //post image to db
            db.collection("posts").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              caption: caption,
              imageUrl: url,
              username: username,
              userUId: userUId
            })

            setProgress(0)
            setCaption('')
            setImage('')
          })
      },
    )

  };

  return (
    <div className="imageupload">
      <progress className="imageupload__progress" value={progress} max="100" />
      <input 
        type="text" 
        placeholder="Enter a caption..." 
        value={caption} 
        onChange={(event) => { setCaption(event.target.value)}} 
      />

      <div className="imageupload__fileInput">
        <div className="imageupload__fileInputLeft">
          <input name="fileInput" ref={fileInput} type="file" onChange={handleChange} />
          <Button className="imageuplpoad__fileInputButton" onClick={() => { fileInput.current.click() }}>Choose a file...</Button>
        </div>

        <div className="imageupload__fileinputRight">
          <Button className="imageUpload__button" onClick={handleUpload}>
            Upload
          </Button>
        </div>      
      </div>
    </div>
  )
}

export default ImageUpload

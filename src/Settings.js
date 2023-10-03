import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import firebase from 'firebase'

import { db } from './firebase'
import './Settings.css'

export default function Settings(props) {
  const [open, setOpen] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [photoURL, setPhotoURL] = React.useState('');
  const [userImageUrl, setUserImageUrl] = React.useState('');
  const captchaRef = React.useRef('');

  const handleClose = () => {
    setOpen(false)
    props.handleSettingClickClose()
  };

  const handleSubmit = (event) => {
    setOpen(false)
    props.handleSettingClickClose()

    const applicationVerifier = new firebase.auth.RecaptchaVerifier(
      captchaRef.current, {
      'size': 'invisible'
    });

    let provider = new firebase.auth.PhoneAuthProvider();
    provider.verifyPhoneNumber(phoneNumber, applicationVerifier)
      .then(function (verificationId) {
        let verificationCode = window.prompt('Please enter the verification ' +
          'code that was sent to your mobile device.');
        return firebase.auth.PhoneAuthProvider.credential(verificationId,
          verificationCode);
      })
      .then(function (phoneCredential) {
        return props.user.updatePhoneNumber(phoneCredential);
      })
      .catch((error) => alert(error.message));

      setPhoneNumber(props.user.phoneNumber)
  };

  useEffect(() => {
    setOpen(props.settingsDialogOpen);
    setPhoneNumber(props.user?.phoneNumber ? props.user.phoneNumber : '')
    setPhotoURL(props.user?.photoURL ? props.user.photoURL : '')
    let usersRef = db.collection("users")
    usersRef.where("uid", "==", props.userUID).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          setUserImageUrl(doc.data().imageUrl)
        })
      })
  }, [props.settingsDialogOpen, props.user])

  return (
    <div>
      <div id="captchaRef" ref={captchaRef}></div>

      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Profile</DialogTitle>
        <DialogContent>
          <DialogContentText>
            View and update your profile.
          </DialogContentText>
          <div className="settings__inputs">
            <div>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                type="text"
                value={props?.user?.displayName}
                fullWidth
                disabled
              />
              <TextField
                autoFocus
                margin="dense"
                id="email"
                label="Email Address"
                type="email"
                value={props?.user?.email}
                fullWidth
                disabled
              />
              <TextField
                autoFocus
                margin="dense"
                id="phoneNumber"
                label="Phone number"
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                fullWidth
              />
            </div>
            <div>
              <img className="settings__userImage" alt="Upload a photo to display" src={userImageUrl} />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

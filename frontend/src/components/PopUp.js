import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function PopUp(
  {
    show = true,
    title = "",
    description = "Description",
    onButtonClick = () => {},
    onClosing = () => {},
    buttonTitle = "Ok",
  },
  ...props
) {
  const [open, setOpen] = useState(show);

  const handleClose = () => {
    setOpen(false);
    onClosing();
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();

              onButtonClick();
            }}
            color="primary"
          >
            {buttonTitle}
          </Button>
          <Button onClick={handleClose} color="secondary">
            cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

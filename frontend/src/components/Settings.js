import React, { useState } from "react";
import PopUp from "./PopUp";
import {
  Button,
  Grid,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Collapse,
} from "@material-ui/core";
import { render } from "react-dom";

import { Alert } from "@material-ui/lab";

export default function Settings(props) {
  const [guestCanPause, setGuestCanPause] = useState(props.guestCanPause);
  const [votesToSkip, setVotesToSkip] = useState(props.votesToSkip);
  const code = props.roomCode;

  function handleUpdateButtonClicked() {
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
        code: code,
      }),
    };
    fetch("/api/update-room", requestOptions).then((response) => {
      if (response.ok) {
        props.getRoomDetails();
        console.log("room updated on host side successfully");
        props.setAlertParams({
          text: "Updated Room Successfully!",
          show: true,
          bgColor: "info",
        });
      } else {
        console.log("did not update room");
        props.setAlertParams({
          text: "Could not update room. Please try again later...",
          show: true,
          bgColor: "danger",
        });
      }
    });
  }
  return (
    <Grid item xs={12}>
      <PopUp
        buttonTitle="Update"
        onClosing={props.onClosing}
        description={
          <UpdatePopUp
            votesToSkip={votesToSkip}
            guestCanPause={guestCanPause}
            setGuestCanPause={setGuestCanPause}
            setVotesToSkip={setVotesToSkip}
          />
        }
        onButtonClick={handleUpdateButtonClicked}
      />
    </Grid>
  );
}

export function UpdatePopUp(props) {
  let setVotesToSkip = props.setVotesToSkip;
  let setGuestCanPause = props.setGuestCanPause;
  let votesToSkip = props.votesToSkip;
  let guestCanPause = props.guestCanPause;

  return (
    <Grid container spacing={3} align="center">
      <Grid item xs={12}>
        <Typography component="h3" variant="h3">
          Update Room
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormHelperText>
            <div align="center">Guest Control of Playback State</div>
          </FormHelperText>

          <RadioGroup
            defaultValue={guestCanPause.toString()}
            onChange={(e) => {
              setGuestCanPause(e.target.value == "true" ? true : false);
            }}
          >
            <div align="center">
              <FormControlLabel
                value="true"
                control={<Radio color="primary" />}
                label="Play/Pause"
              />
              <FormControlLabel
                value="false"
                control={<Radio color="secondary" />}
                label="No Control"
              />
            </div>
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl>
          <TextField
            required={true}
            type="number"
            defaultValue={votesToSkip}
            inputProps={{
              min: 1,
              style: { textAlign: "center" },
            }}
            onChange={(e) => {
              setVotesToSkip(parseInt(e.target.value));
            }}
          />
          <FormHelperText>
            <div align="center">Votes Required To Skip Song</div>
          </FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
}

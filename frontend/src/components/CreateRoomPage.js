import React, { useState, useEffect } from "react";

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
} from "@material-ui/core";
import { Link } from "react-router-dom";
export default function CreateRoomPage(props) {
  let defaultVotes = 1;
  const [guestCanPause, setGuestCanPause] = useState(true);
  const [votesToSkip, setVotesToSkip] = useState(defaultVotes);

  const handleCreateButtonClicked = () => {
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
      }),
    };
    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        props.history.push("/room/" + data.code);
        props.setAlertParams({
          text: "Created Room Successfully!",
          show: true,
          bgColor: "success",
        });
      });
  };

  return (
    <Grid container spacing={3} align="center">
      <Grid item xs={12}>
        <Typography component="h3" variant="h3">
          Create A Room
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormHelperText>
            <div align="center">Guest Control of Playback State</div>
          </FormHelperText>

          <RadioGroup
            defaultValue="true"
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
            defaultValue={defaultVotes}
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
      <Grid item xs={12}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleCreateButtonClicked}
        >
          Create Room
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="outlined"
          color="secondary"
          disableElevation
          to="/join"
          component={Link}
        >
          Join A Room Instead
        </Button>
      </Grid>
    </Grid>
  );
}

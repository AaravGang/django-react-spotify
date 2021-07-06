import React, { useState } from "react";
import {
  Button,
  Grid,
  Typography,
  TextField,
  FormControl,
} from "@material-ui/core";
import { Link } from "react-router-dom";

export default function JoinRoomPage(props) {
  const [error, setError] = useState("");
  const [roomCode, setCode] = useState("");

  const handleJoinRoomButtonClicked = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: roomCode }),
    };

    fetch("/api/join-room", requestOptions)
      .then((response) => {
        if (response.ok) {
          props.history.push(`/room/${roomCode}`);
          props.setAlertParams({
            text: "Joined Room Successfully!",
            show: true,
            bgColor: "success",
          });
        } else {
          setError("Invalid Room Code");
        }
      })
      .catch((error) => {
        props.setAlertParams({
          text: error.toString(),
          show: true,
          bgColor: "danger",
        });
        console.log(error);
      });
  };

  return (
    <Grid container align="center" spacing={3}>
      <Grid item xs={12}>
        <Typography component="h3" variant="h3">
          Join A Room!
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="join-room-text-field"
          variant="filled"
          label="Code"
          placeholder="Enter A Room Code"
          error={error}
          helperText={error}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleJoinRoomButtonClicked}
        >
          Join Room
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="outlined"
          color="secondary"
          disableElevation
          to="/create"
          component={Link}
        >
          Create A Room Instead
        </Button>
      </Grid>
    </Grid>
  );
}

import React, { useState, useEffect } from "react";
import { Button, Typography, Grid } from "@material-ui/core";
import Settings from "./Settings";
import PopUp from "./PopUp";
import MusicPlayer from "./MusicPlayer";

export default function Room(props) {
  let roomCode = props.match.params.roomCode;
  const [votesToSkip, setVotesToSkip] = useState(1);
  const [guestCanPause, setGuestCanPause] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, updateShowSettings] = useState(false);
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [song, setSong] = useState({});

  getRoomDetails();
  // const [showAuthenticateMsg,setShowAuthenticateMsg] = useState(false)

  useEffect(() => {
    let currentSongInterval = setInterval(getCurrentSong, 1000);

    return () => {
      clearInterval(currentSongInterval);
    };
  }, []);

  function getRoomDetails() {
    fetch("/api/get-room?code=" + roomCode)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        props.leaveRoomCallback(null);
        props.history.push("/");
        props.setAlertParams({
          text: isHost
            ? "Left room successfully"
            : "This room has been deleted!",
          show: true,
          bgColor: isHost ? "success" : "danger",
        });
      })
      .then((data) => {
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);

        if (isHost) {
          authenticateSpotify();
        }
      });
    // .catch((e) => {
    //   props.setAlertParams({
    //     text: "Internal Server Error... (while getting room details)",
    //     show: true,
    //     bgColor: "danger",
    //   });
    //   console.log(e);
    // });
  }

  const authenticateSpotify = () => {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        setSpotifyAuthenticated(data.status);
      });
  };

  const showAuthenticatePopUp = () => {
    return (
      <PopUp
        title="Authenticate Spotify Account"
        description="
      To continue you need to authenticate your spotify account...
      "
        buttonTitle="Authenticate"
        onButtonClick={() => {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
              setSpotifyAuthenticated(true);
            });
        }}
      />
    );
  };

  function getCurrentSong() {
    fetch("/spotify/current-song")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return {};
        }
      })
      .then((data) => {
        setSong(data);
      })
      .catch((e) => {
        console.log(e);
        setSong({});
      });
  }

  const leaveButtonClicked = () => {
    let requestOptions = {
      headers: { "Content-Type": "application/json" },
      method: "POST",
    };

    fetch("/api/leave-room", requestOptions)
      .then((_response) => {
        props.leaveRoomCallback(null);
        props.history.push("/");
        props.setAlertParams({
          text: "Left Room Successfully!",
          show: true,
          bgColor: "success",
        });
      })
      .catch((e) => {
        props.setAlertParams({
          text: "Internal Server Error...while leaving room",
          show: true,
          bgColor: "danger",
        });
      });
  };

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            updateShowSettings(true);
          }}
        >
          Settings
        </Button>
        {showSettings ? (
          <Settings
            onClosing={() => {
              updateShowSettings(false);
            }}
            getRoomDetails={getRoomDetails}
            roomCode={roomCode}
            votesToSkip={votesToSkip}
            guestCanPause={guestCanPause}
            isHost={isHost}
            setAlertParams={props.setAlertParams}
          />
        ) : null}
      </Grid>
    );
  };

  return (
    <Grid container spacing={4} align="center">
      <Grid item xs={12}>
        <Typography color="primary" variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>

      <MusicPlayer {...song} />

      {isHost ? renderSettingsButton() : null}

      <Grid item xs={12}>
        <Button
          color="secondary"
          variant="contained"
          onClick={leaveButtonClicked}
        >
          Leave Room
        </Button>
      </Grid>
      {!spotifyAuthenticated && isHost ? showAuthenticatePopUp() : null}
    </Grid>
  );
}

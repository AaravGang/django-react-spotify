import React, { useState, useEffect } from "react";
import JoinRoomPage from "./JoinRoomPage";
import CreateRoomPage from "./CreateRoomPage";
import PopUp from "./PopUp";
import Room from "./Room";
import { Button, Grid, Typography, ButtonGroup } from "@material-ui/core";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

export default function HomePage(homePageProps) {
  let [roomCode, setRoomCode] = useState(null);
  let [redirect, setRedirect] = useState(false);
  async function getPreviousRoomCode() {
    await fetch("/api/redirect-room")
      .then((response) => response.json())
      .then((data) => {
        setRoomCode(data.code);
      })
      .catch((e) => console.log(e));
  }
  useEffect(getPreviousRoomCode, []);
  function renderHomePage() {
    return (
      <Grid spacing={5} container align="center">
        <Grid item xs={12}>
          <Typography
            color="primary"
            display="inline"
            variant="h1"
            component="h1"
          >
            Song Bud!
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <ButtonGroup variant="contained">
            <Button to="/create" component={Link}>
              Create a Room
            </Button>
            <Button color="secondary" to="/join" component={Link}>
              Join a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  function handleRedirect() {
    return (
      <div>
        <PopUp
          onButtonClick={() => {
            setRedirect(true);
          }}
          title="Rejoin Previous Room?"
          description={`Rejoin previous room with Room Code ${roomCode}`}
          buttonTitle="Rejoin"
        />
        {redirect ? <Redirect to={`room/${roomCode}`} /> : null}
      </div>
    );
  }

  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/">
            {renderHomePage()}
            {roomCode ? handleRedirect() : null}
          </Route>

          <Route
            path="/join"
            render={(props) => {
              return (
                <JoinRoomPage
                  {...props}
                  setAlertParams={homePageProps.setAlertParams}
                />
              );
            }}
          />

          <Route
            path="/create"
            render={(props) => {
              return (
                <CreateRoomPage
                  {...props}
                  setAlertParams={homePageProps.setAlertParams}
                />
              );
            }}
          ></Route>
          <Route
            path="/room/:roomCode"
            render={(props) => {
              return (
                <Room
                  {...props}
                  leaveRoomCallback={setRoomCode}
                  setAlertParams={homePageProps.setAlertParams}
                />
              );
            }}
          />
        </Switch>
      </Router>
    </div>
  );
}

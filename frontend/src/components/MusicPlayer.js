import React, { useState } from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@material-ui/core";

import SkipNextIcon from "@material-ui/icons/SkipNext";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";

export default function MusicPlayer(
  {
    title = "No Song Playing",
    artists = "...",
    progress = 0,
    duration = 1,
    image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png",
    is_playing = false,
  },
  ...props
) {
  return (
    <Card xs={12}>
      <Grid container alignItems="center" align="center">
        <Grid item xs={4}>
          <img src={image_url} height="100%" width="100%" />
        </Grid>

        <Grid item xs={8} style={{ width: "100%" }}>
          <Typography noWrap={true} component="h5" variant="h5">
            {title}
          </Typography>
          <Typography noWrap={true}  color="textSecondary" variant="subtitle1">
            {artists}
          </Typography>
          <div>
            <IconButton disabled={true}>
              {is_playing ? (
                <PauseCircleFilledIcon />
              ) : (
                <PlayCircleFilledIcon />
              )}
            </IconButton>
            <IconButton disabled={true}>
              <SkipNextIcon />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <LinearProgress
        variant="determinate"
        value={(progress / duration) * 100}
      />
    </Card>
  );
}

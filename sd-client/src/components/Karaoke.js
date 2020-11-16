import React, { Component, createRef } from "react";
import CDGKaraokePlayer from "karaoke";
import {
  withStyles,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
} from "@material-ui/core";
import { PlayCircleFilledWhite } from "@material-ui/icons";
import songs from "../songs";
import Header from "./Header";

const karaokeStyles = theme => ({
  title: {
    fontWeight: 400,
  },
  container: {
    marginTop: "50px",
  },
  root: {
    padding: "theme.spacing(1)",
    [theme.breakpoints.down("sm")]: {},
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
    [theme.breakpoints.up("lg")]: {
      display: "flex",
    },
  },
  demo: {
    maxHeight: "100vh",
    overflow: "auto",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
    [theme.breakpoints.up("md")]: {},
    [theme.breakpoints.up("lg")]: {},
  },
});

export class Karaoke extends Component {
  constructor(props) {
    super(props);
    this.karaoke = new CDGKaraokePlayer();
    this.container = createRef();
    this.state = {
      dense: true,
    };
  }

  componentDidMount() {
    this.container.current.appendChild(this.karaoke.canvas);
    this.container.current.appendChild(this.karaoke.audio);
  }

  loadAndPlay = name => {
    this.karaoke.loadAndPlay(`${name}.mp3`, `${name}.cdg`);
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <div>
          <Header />
          <List className={classes.demo} dense={this.state.dense}>
            {songs.map((value, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar src={`${value}.png`}></Avatar>
                </ListItemAvatar>
                <Typography variant="h5">{value}</Typography>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => this.loadAndPlay(value)}
                  >
                    <PlayCircleFilledWhite />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
        <div className={classes.container} ref={this.container}></div>
      </div>
    );
  }
}

export default withStyles(karaokeStyles)(Karaoke);
import React, { Component } from "react";
import uuid from "react-uuid";
import { withStyles, IconButton } from "@material-ui/core";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { InsertEmoticon } from "@material-ui/icons";
import styles from "../styles";
import axios from "axios";

const reactionStyles = (theme) => ({
  ...styles.reactionStyles,
});

export class Reactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopover: false,
      reaction: null,
    };
  }

  componentDidMount() {
    this.setState({ reaction: this.props.reaction });
  }

  react = (reaction) => {
    console.log(this.props.id);

    this.setState({ reaction });

    axios
      .post("/react", {
        reaction,
        messageId: this.props.id,
        from: localStorage.getItem("user"),
        to: this.props.to,
      })
      .catch((err) => console.error(err));
  };

  handlePopover = () => {
    this.setState({ showPopover: !this.state.showPopover });
  };

  render() {
    const { classes } = this.props;
    const reactions = ["💗", "👏", "🌷", "🥰", "👌", "🔥"];

    return (
      <OverlayTrigger
        trigger="click"
        placement="top"
        show={this.state.showPopover}
        onToggle={this.handlePopover}
        transition={false}
        rootClose
        overlay={
          <Popover className="rounded-pill">
            <Popover.Content className="d-flex px-0 py-1 align-items-center">
              {reactions.map((reaction) => (
                <IconButton
                  variant="link"
                  className={classes.reaction}
                  key={uuid()}
                  onClick={() => this.react(reaction)}
                >
                  {reaction}
                </IconButton>
              ))}
            </Popover.Content>
          </Popover>
        }
      >
        <IconButton>
          {this.state.reaction ? this.state.reaction : <InsertEmoticon />}
        </IconButton>
      </OverlayTrigger>
    );
  }
}

export default withStyles(reactionStyles)(Reactions);

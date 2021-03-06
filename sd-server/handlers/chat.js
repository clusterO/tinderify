const db = require("../models");
const { newMessage, callRequest } = require("../utils/socket");
const { v4: uuidv4 } = require("uuid");

const User = db.user;

// SocketIo with MongoDb stream Change IM chat
const filter = [
  {
    $match: {
      $and: [
        { "updateDescription.updatedFields.messages": { $exists: true } },
        { operationType: "update" },
      ],
    },
  },
];

const options = { fullDocument: "updateLookup" };

User.watch(filter, options).on("change", (data) => {});

exports.friends = (req, res) => {
  User.findOne({
    handle: req.query.handle,
  }).exec((err, user) => {
    if (err) return res.status(500).send({ message: err });
    if (!user) return res.status(404).send({ message: "User not found" });

    return res.status(200).json(user.friends);
  });
};

// DRY it
exports.react = (req, res) => {
  User.findOne({ handle: req.body.to }).exec((err, user) => {
    if (err) return res.status(500).send({ message: err });
    if (!user) return res.status(401).send({ message: "User not found" });

    let index = user.messages.findIndex(
      (message) => message.id === req.body.messageId
    );

    if (index !== -1) {
      user.messages[index].reaction = req.body.reaction;

      const update = {
        messages: [...user.messages],
      };

      user.updateOne(update, (err) => {
        if (err) return res.status(500).send({ message: err });
        user.save();
      });
    }
  });

  User.findOne({ handle: req.body.from }).exec((err, user) => {
    if (err) return res.status(500).send({ message: err });
    if (!user) return res.status(401).send({ message: "User not found" });

    let index = user.messages.findIndex(
      (message) => message.id === req.body.messageId
    );

    if (index !== -1) {
      user.messages[index].reaction = req.body.reaction;

      const update = {
        messages: [...user.messages],
      };

      user.updateOne(update, (err) => {
        if (err) return res.status(500).send({ message: err });
        user.save();

        newMessage({
          handle: req.body.to,
          contact: req.body.from,
          content: req.body.reaction,
          type: "reaction",
        });
      });
    }
  });

  return res.status(200).send({ message: "reaction updated" });
};

exports.requestCall = (req, res) => {
  let song = req.body.song;
  let to = req.body.to;
  let from = req.body.from;

  callRequest({ handle: to, contact: from, song });

  return res.status(200).send({ msg: "call sent" });
};

exports.sendMessage = (req, res) => {
  let content = req.body.content;
  let to = req.body.to;
  let from = req.body.from;
  let id = uuidv4();
  let date = Date.now();
  let read = false;
  let reaction = "";
  let uri = req.body.uri ? (uri = req.body.uri) : "";

  User.findOne({ handle: to }).exec((err, user) => {
    if (err) return res.status(500).send({ message: err });
    if (!user) return res.status(401).send({ message: "User not found" });

    let update = {
      messages: [
        { id, content, from, date, read, reaction, uri },
        ...user.messages,
      ],
    };

    user.updateOne(update, (err) => {
      if (err) return res.status(500).send({ message: err });
      user.save();

      newMessage({ id, handle: to, contact: from, content, type: "message" });
    });
  });

  User.findOne({ handle: from }).exec((err, user) => {
    if (err) return res.status(500).send({ message: err });
    if (!user) return res.status(401).send({ message: "User not found" });

    let index = user.friends.findIndex((friend) => friend.handle === to);

    if (index !== -1) user.friends[index].message = content;

    let update = {
      messages: [
        { id, content, to, date, read, reaction, uri },
        ...user.messages,
      ],
      friends: [...user.friends],
    };

    user.updateOne(update, (err, data) => {
      if (err) return res.status(500).send({ message: err });
      user.save();
      return res.status(200).send(data);
    });
  });
};

exports.getMessages = (req, res) => {
  let messages = [];

  User.findOne({
    handle: req.query.handle,
  }).exec((err, user) => {
    if (err) return res.status(500).send({ message: err });
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.messages)
      messages = user.messages.filter(
        (msg) => msg.from === req.query.from || msg.to === req.query.from
      );

    messages.forEach((msg) => {
      msg.read = true;
    });

    res
      .status(200)
      .send({ messages: messages.splice(0, 20), length: messages.length });
  });
};

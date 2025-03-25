const users = {}; // Stores users in each meeting
const socketToPeer = {}; // Maps socket.id -> peerId

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-meeting", ({ meetingId, peerId }) => {
      if (!meetingId || !peerId) {
        return socket.emit("error", "Invalid meetingId or peerId");
      }

      if (!users[meetingId]) users[meetingId] = [];

      // Prevent duplicate users in the same meeting
      if (!users[meetingId].includes(peerId)) {
        users[meetingId].push(peerId);
      }

      socketToPeer[socket.id] = peerId; // Map socket ID to peer ID

      socket.join(meetingId);
      socket.emit(
        "all-users",
        users[meetingId].filter((id) => id !== peerId)
      );

      socket.to(meetingId).emit("user-joined", { callerId: peerId });
    });

    socket.on("sending-signal", (payload) => {
      const recipientSocket = io.sockets.sockets.get(payload.userToSignal);

      if (!recipientSocket) {
        console.warn(`User to signal ${payload.userToSignal} not found`);
        return;
      }

      recipientSocket.emit("user-joined", {
        signal: payload.signal,
        callerId: payload.callerId,
      });
    });

    socket.on("returning-signal", (payload) => {
      const callerSocket = io.sockets.sockets.get(payload.callerId);

      if (!callerSocket) {
        console.warn(`Caller ${payload.callerId} not found`);
        return;
      }

      callerSocket.emit("receiving-returned-signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    socket.on("leave-meeting", ({ meetingId, peerId }) => {
      if (users[meetingId]) {
        users[meetingId] = users[meetingId].filter((id) => id !== peerId);
        if (users[meetingId].length === 0) delete users[meetingId];
      }
      socket.to(meetingId).emit("user-disconnected", peerId);
      console.log(`User ${peerId} left meeting ${meetingId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const peerId = socketToPeer[socket.id];

      if (peerId) {
        for (const meetingId in users) {
          if (users[meetingId].includes(peerId)) {
            users[meetingId] = users[meetingId].filter((id) => id !== peerId);
            socket.to(meetingId).emit("user-disconnected", peerId);
            console.log(`User ${peerId} removed from meeting ${meetingId}`);
          }
        }
      }

      delete socketToPeer[socket.id]; // Clean up
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });
};

// const users = {}; // Stores users in each meeting
// const socketToPeer = {}; // Stores socket.id -> peerId mapping

// module.exports = (io) => {
//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     socket.on("join-meeting", ({ meetingId, peerId }) => {
//       if (!meetingId || !peerId) {
//         return socket.emit("error", "Invalid meetingId or peerId");
//       }

//       if (!users[meetingId]) users[meetingId] = [];
//       users[meetingId].push(peerId);
//       socketToPeer[socket.id] = peerId; // Map socket ID to peer ID

//       socket.join(meetingId);
//       socket.emit(
//         "all-users",
//         users[meetingId].filter((id) => id !== peerId)
//       );

//       socket.to(meetingId).emit("user-joined", { callerId: peerId });
//     });

//     socket.on("sending-signal", (payload) => {
//       if (
//         !payload.userToSignal ||
//         !io.sockets.sockets.get(payload.userToSignal)
//       ) {
//         return socket.emit("error", "User to signal not found");
//       }
//       io.to(payload.userToSignal).emit("user-joined", {
//         signal: payload.signal,
//         callerId: payload.callerId,
//       });
//     });

//     socket.on("returning-signal", (payload) => {
//       if (!payload.callerId || !io.sockets.sockets.get(payload.callerId)) {
//         return socket.emit("error", "Caller not found");
//       }
//       io.to(payload.callerId).emit("receiving-returned-signal", {
//         signal: payload.signal,
//         id: socket.id,
//       });
//     });

//     socket.on("leave-meeting", ({ meetingId, peerId }) => {
//       if (users[meetingId]) {
//         users[meetingId] = users[meetingId].filter((id) => id !== peerId);
//         if (users[meetingId].length === 0) delete users[meetingId];
//       }
//       socket.to(meetingId).emit("user-disconnected", peerId);
//       console.log(`User ${peerId} left meeting ${meetingId}`);
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//       const peerId = socketToPeer[socket.id];

//       if (peerId) {
//         for (const meetingId in users) {
//           users[meetingId] = users[meetingId].filter((id) => id !== peerId);
//           if (users[meetingId].length === 0) delete users[meetingId];
//           socket.to(meetingId).emit("user-disconnected", peerId);
//         }
//       }

//       delete socketToPeer[socket.id]; // Clean up
//     });

//     socket.on("error", (err) => {
//       console.error("Socket error:", err);
//     });
//   });
// };

// const users = {}; // Stores users in each meeting

// module.exports = (io) => {
//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     // When a user joins a meeting
//     socket.on("join-meeting", ({ meetingId, peerId }) => {
//       if (!users[meetingId]) users[meetingId] = [];
//       users[meetingId].push(peerId);

//       socket.join(meetingId);
//       socket.emit(
//         "all-users",
//         users[meetingId].filter((id) => id !== peerId)
//       );

//       socket.to(meetingId).emit("user-joined", { callerId: peerId });
//     });

//     // Handle sending WebRTC signal to another user
//     socket.on("sending-signal", (payload) => {
//       io.to(payload.userToSignal).emit("user-joined", {
//         signal: payload.signal,
//         callerId: payload.callerId,
//       });
//     });

//     // Handle receiving a signal and sending it back
//     socket.on("returning-signal", (payload) => {
//       io.to(payload.callerId).emit("receiving-returned-signal", {
//         signal: payload.signal,
//         id: socket.id,
//       });
//     });

//     // Handle user disconnecting
//     socket.on("leave-meeting", ({ meetingId, peerId }) => {
//       if (users[meetingId]) {
//         users[meetingId] = users[meetingId].filter((id) => id !== peerId);
//       }
//       socket.to(meetingId).emit("user-disconnected", peerId);
//       console.log(`User ${peerId} left meeting ${meetingId}`);
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//       for (const meetingId in users) {
//         users[meetingId] = users[meetingId].filter((id) => id !== socket.id);
//         socket.to(meetingId).emit("user-disconnected", socket.id);
//       }
//     });
//   });
// };

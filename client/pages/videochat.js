import React from "react";
import socket from "socket.io-client";
// import webrtc from "rtcmulticonnection-v3";
import withWeb3 from "../lib/withWeb3";

export default class VideoChat extends React.Component {
  componentDidMount() {
    const connection = new RTCMultiConnection();

    // this line is VERY_important
    connection.socketURL = `https://rtcmulticonnection.herokuapp.com:443/`;

    // all below lines are optional; however recommended.

    connection.session = {
      audio: true,
      video: true,
    };

    connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true,
    };

    connection.onstream = function (event) {
      document.body.appendChild(event.mediaElement);
    };

    const predefinedRoomId = `joshma`;

    document.getElementById(`btn-open-room`).onclick = function () {
      this.disabled = true;
      connection.open(predefinedRoomId);
    };

    document.getElementById(`btn-join-room`).onclick = function () {
      this.disabled = true;
      connection.join(predefinedRoomId);
    };
  }

  render() {
    const { accounts, contractInstance, web3 } = this.props;
    return (
      <div>
        <h1>Page for teacher-student videochat</h1>

        <button id="btn-open-room">Open Room</button>
        <button id="btn-join-room">Join Room</button>
        <button id="btn-pause">Pause session</button>
        <button id="btn-leave-room">Finish Session</button>

        <pre>{JSON.stringify(accounts, null, 4)}</pre>
      </div>
    );
  }
}

// export default withWeb3(VideoChat);

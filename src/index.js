import AgoraRTC from "agora-rtc-sdk-ng";
import * as deepar from "deepar";

const licenseKey = "your_license_key_goes_here";
const appId = "**appId**";
const token = "**token**";
const channel = "**channel name**";

// Log the version. Just in case.
console.log("Deepar version: " + deepar.version);
console.log("Agora version: " + AgoraRTC.VERSION);

// Top-level await is not supported.
// So we wrap the whole code in an async function that is called immediately.
(async function () {
  // trigger loading progress bar animation
  const loadingProgressBar = document.getElementById("loading-progress-bar");
  loadingProgressBar.style.width = "100%";

  // All the effects are in the public/effects folder.
  // Here we define the order of effect files.
  const effectList = [
    "effects/ray-ban-wayfarer.deepar",
    "effects/viking_helmet.deepar",
    "effects/MakeupLook.deepar",
    "effects/Split_View_Look.deepar",
    "effects/flower_face.deepar",
    "effects/Stallone.deepar",
    "effects/galaxy_background_web.deepar",
    "effects/Humanoid.deepar",
    "effects/Neon_Devil_Horns.deepar",
    "effects/Ping_Pong.deepar",
    "effects/Pixel_Hearts.deepar",
    "effects/Snail.deepar",
    "effects/Hope.deepar",
    "effects/Vendetta_Mask.deepar",
    "effects/Fire_Effect.deepar",
  ];

  let deepAR = null;

  // Initialize DeepAR with an effect file.
  try {
    deepAR = await deepar.initialize({
      licenseKey: licenseKey,
      previewElement: document.querySelector("#deepar-screen"),
      effect: effectList[0],
      rootPath: "./deepar-resources",
    });
  } catch (error) {
    console.error(error);
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("permission-denied-screen").style.display = "block";
    return;
  }

  let agoraEngine = new AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });
  var remoteStreams = {};
  var mainStreamId;

  agoraEngine.on("user-published", async (user, mediaType) => {
    await agoraEngine.subscribe(user, mediaType);
    user["type"] = mediaType;
    let remoteAudioTrack, remoteVideoTrack;
    let remoteId = user.uid;

    if (mediaType == "video") {
      remoteAudioTrack = user.audioTrack;
      remoteVideoTrack = user.videoTrack;
      if ($("#full-screen-video").is(":empty")) {
        // first remote, set as main stream
        remoteStreams[remoteId] = user;
        mainStreamId = remoteId;
        remoteVideoTrack.play("full-screen-video");
      } else {
        // add as mini view
        agoraEngine.setRemoteVideoStreamType(user.uid, 1); // subscribe to low quality stream
        addRemoteStreamMiniView(user);
      }
    }
    if (mediaType == "audio") {
      remoteAudioTrack = user.audioTrack;
      // Play the remote audio track. No need to pass any DOM element.
      remoteAudioTrack.play();
    }
    console.log("Subscribe remote stream successfully: " + remoteId);
  });
  agoraEngine.on("user-unpublished", (user) => {
    console.log(user.uid + " has left the channel");
    var streamId = user.uid; // the the stream id
    if (remoteStreams[streamId] != undefined) {
      delete remoteStreams[streamId]; // remove stream from list
      if (streamId == mainStreamId) {
        var streamIds = Object.keys(remoteStreams);
        if (streamIds.length == 0) return;
        var randomId = streamIds[Math.floor(Math.random() * streamIds.length)]; // select from the remaining streams
        var remoteContainerID = "#" + randomId + "_container";
        $(remoteContainerID).empty().remove(); // remove the stream's miniView container
        remoteStreams[randomId].videoTrack.play("full-screen-video"); // play the random stream as the main stream
        mainStreamId = randomId; // set the new main remote stream
      } else {
        var remoteContainerID = "#" + streamId + "_container";
        $(remoteContainerID).empty().remove(); //
      }
    }
  });

  function addRemoteStreamMiniView(user) {
    var streamId = user.uid;
    // append the remote stream template to #remote-streams
    $("#remote-streams").append(
      $("<div/>", {
        id: streamId + "_container",
        class: "remote-stream-container col",
      }).append(
        $("<div/>", { id: "agora_remote_" + streamId, class: "remote-video" })
      )
    );
    user.videoTrack.play("agora_remote_" + streamId);
    remoteStreams[streamId] = user;

    var containerId = "#" + streamId + "_container";
    $(containerId).dblclick(function () {
      agoraEngine.setRemoteVideoStreamType(mainStreamId, 1);
      agoraEngine.setRemoteVideoStreamType(streamId, 0); 
      // play selected container as full screen - swap out current full screen stream
      $(containerId).empty().remove(); // remove the stream's miniView container
      remoteStreams[mainStreamId].videoTrack.stop(); // stop the main video stream playback
      addRemoteStreamMiniView(remoteStreams[mainStreamId]); // send the main video stream to a container
      remoteStreams[streamId].videoTrack.stop(); // stop the container's video stream playback
      remoteStreams[streamId].videoTrack.play("full-screen-video"); // play the remote stream as the full screen video
      mainStreamId = streamId; // set the container stream id as the new main stream id
    });
  }

  await agoraEngine.join(appId, channel, token);

  const canvas = deepAR.getCanvas();

  const canvasContext = canvas.getContext("webgl2"); // If this is not called, captureStream() throws on Firefox.
  const outputStream = canvas.captureStream(30);
  let videoTrack = outputStream.getVideoTracks()[0];
  let localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  let localVideoTrack = AgoraRTC.createCustomVideoTrack({
    mediaStreamTrack: videoTrack,
  });
  agoraEngine.publish([localVideoTrack, localAudioTrack]);

  // Event Listeners

  // Hide the loading screen.
  document.getElementById("main-container").hidden = false;
  document.getElementById("loading-screen").style.display = "none";

  let filterIndex = 0;
  const changeFilterButton = document.getElementById("change-filter-button");
  changeFilterButton.onclick = async function () {
    changeFilterButton.disabled = true;
    filterIndex = (filterIndex + 1) % effectList.length;
    await deepAR.switchEffect(effectList[filterIndex]);
    changeFilterButton.disabled = false;
  };

  let visible = true;
  document.addEventListener("visibilitychange", function (event) {
    visible = !visible;
    if (!visible) {
      deepAR.setOffscreenRenderingEnabled(true);
    } else {
      deepAR.setOffscreenRenderingEnabled(false);
    }
  });
})();

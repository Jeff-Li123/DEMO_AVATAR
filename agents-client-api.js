'use strict';

import { transcribeAudio, audioChunks } from './audio-record.js';

const fetchJsonFile = await fetch("./api.json")
const DID_API = await fetchJsonFile.json()
if (DID_API.key == '😂') alert('Please put your api key inside ./api.json and restart..');

const RTCPeerConnection = (
  window.RTCPeerConnection ||
  window.webkitRTCPeerConnection ||
  window.mozRTCPeerConnection
).bind(window);

let peerConnection;
let streamId;
let sessionId;
let sessionClientAnswer;
let statsIntervalId;
let videoIsPlaying;
let lastBytesReceived;

// 使用已有的AgentID
let agentId = "agt_ZYM-F0Np";  
let chatId; // 点击Create Chat按钮后创建

const videoElement = document.getElementById('video-element');
videoElement.setAttribute('playsinline', '');

const peerStatusLabel = document.getElementById('peer-status-label');
const iceStatusLabel = document.getElementById('ice-status-label');
const iceGatheringStatusLabel = document.getElementById('ice-gathering-status-label');
const signalingStatusLabel = document.getElementById('signaling-status-label');
const streamingStatusLabel = document.getElementById('streaming-status-label');
const agentIdLabel = document.getElementById('agentId-label');
const chatIdLabel = document.getElementById('chatId-label');
const textArea = document.getElementById("textArea");

const createChatButton = document.getElementById('create-chat-button');
const connectButton = document.getElementById('connect-button');
const destroyButton = document.getElementById('destroy-button');
const startButton = document.getElementById('start-button');

window.onload = async (event) => {
  playIdleVideo();
  // 这里不自动创建chat，由用户点击按钮创建
  agentIdLabel.innerHTML = agentId;
  console.log("Please click 'Create Chat' button to create a new chat session.");
};

createChatButton.onclick = async () => {
  const response = await fetch(`${DID_API.url}/agents/${agentId}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${DID_API.key}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  chatId = data.id;
  agentIdLabel.innerHTML = agentId;
  chatIdLabel.innerHTML = chatId;
  console.log("New chat created. Agent ID:", agentId, "Chat ID:", chatId);

  // 有了chatId后就可以启用connect和send按钮
  connectButton.disabled = false;
  startButton.disabled = false;
  destroyButton.disabled = false;
}

async function createPeerConnection(offer, iceServers) {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection({ iceServers });
    peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
    peerConnection.addEventListener('icecandidate', onIceCandidate, true);
    peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
    peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
    peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
    peerConnection.addEventListener('track', onTrack, true);
  }

  await peerConnection.setRemoteDescription(offer);
  console.log('set remote sdp OK');
  const sessionClientAnswer = await peerConnection.createAnswer();
  console.log('create local sdp OK');
  await peerConnection.setLocalDescription(sessionClientAnswer);
  console.log('set local sdp OK');

  // Data Channel creation (for displaying the Agent's responses as text)
  let dc = await peerConnection.createDataChannel("JanusDataChannel");
  dc.onopen = () => {
    console.log("datachannel open");
  };
  let decodedMsg;
  dc.onmessage = (event) => {
    let msg = event.data
    let msgType = "chat/answer:"
    if (msg.includes(msgType)) {
      msg = decodeURIComponent(msg.replace(msgType, ""))
      console.log(msg)
      decodedMsg = msg
      return decodedMsg
    }
    if (msg.includes("stream/started")) {
      console.log(msg)
      document.getElementById("msgHistory").innerHTML += `<span>${decodedMsg}</span><br><br>`
    }
    else {
      console.log(msg)
    }
  };
  dc.onclose = () => {
    console.log("datachannel close");
  };

  return sessionClientAnswer;
}

function onIceGatheringStateChange() {
  iceGatheringStatusLabel.innerText = peerConnection.iceGatheringState;
  iceGatheringStatusLabel.className = 'iceGatheringState-' + peerConnection.iceGatheringState;
}

function onIceCandidate(event) {
  if (event.candidate) {
    const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
    fetch(`${DID_API.url}/${DID_API.service}/streams/${streamId}/ice`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${DID_API.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate,
        sdpMid,
        sdpMLineIndex,
        session_id: sessionId,
      }),
    });
  }
}

function onIceConnectionStateChange() {
  iceStatusLabel.innerText = peerConnection.iceConnectionState;
  iceStatusLabel.className = 'iceConnectionState-' + peerConnection.iceConnectionState;
  if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
    stopAllStreams();
    closePC();
  }
}

function onConnectionStateChange() {
  peerStatusLabel.innerText = peerConnection.connectionState;
  peerStatusLabel.className = 'peerConnectionState-' + peerConnection.connectionState;
}

function onSignalingStateChange() {
  signalingStatusLabel.innerText = peerConnection.signalingState;
  signalingStatusLabel.className = 'signalingState-' + peerConnection.signalingState;
}

function onVideoStatusChange(videoIsPlaying, stream) {
  let status;
  if (videoIsPlaying) {
    status = 'streaming';
    const remoteStream = stream;
    setVideoElement(remoteStream);
  } else {
    status = 'empty';
    playIdleVideo();
  }
  streamingStatusLabel.innerText = status;
  streamingStatusLabel.className = 'streamingState-' + status;
}

function onTrack(event) {
  if (!event.track) return;
  statsIntervalId = setInterval(async () => {
    const stats = await peerConnection.getStats(event.track);
    stats.forEach((report) => {
     if (report.type === 'inbound-rtp' && report.kind === 'video') {
        const videoStatusChanged = videoIsPlaying !== report.bytesReceived > lastBytesReceived;
        if (videoStatusChanged) {
          videoIsPlaying = report.bytesReceived > lastBytesReceived;
          onVideoStatusChange(videoIsPlaying, event.streams[0]);
        }
        lastBytesReceived = report.bytesReceived;
      }
    });
  }, 500);
}

function setVideoElement(stream) {
  if (!stream) return;
  videoElement.muted = false;
  videoElement.srcObject = stream;
  videoElement.loop = false;
  if (videoElement.paused) {
    videoElement.play().catch((e) => { });
  }
}

function playIdleVideo() {
  videoElement.srcObject = undefined;
  videoElement.src = 'https://agents-results.d-id.com/google-oauth2|111463605347984735376/agt_ZYM-F0Np/idle_1733577842580.mp4';
  videoElement.loop = true;
}

function stopAllStreams() {
  if (videoElement.srcObject) {
    console.log('stopping video streams');
    videoElement.srcObject.getTracks().forEach((track) => track.stop());
    videoElement.srcObject = null;
  }
}

function closePC(pc = peerConnection) {
  if (!pc) return;
  console.log('stopping peer connection');
  pc.close();
  pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
  pc.removeEventListener('icecandidate', onIceCandidate, true);
  pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
  pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
  pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
  pc.removeEventListener('track', onTrack, true);
  clearInterval(statsIntervalId);
  iceGatheringStatusLabel.innerText = '';
  signalingStatusLabel.innerText = '';
  iceStatusLabel.innerText = '';
  peerStatusLabel.innerText = '';
  console.log('stopped peer connection');
  if (pc === peerConnection) {
    peerConnection = null;
  }
}

const maxRetryCount = 3;
const maxDelaySec = 4;
async function fetchWithRetries(url, options, retries = 1) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries <= maxRetryCount) {
      const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
      return fetchWithRetries(url, options, retries + 1);
    } else {
      throw new Error(`Max retries exceeded. error: ${err}`);
    }
  }
}

connectButton.onclick = async () => {
  if (!agentId || !chatId) {
    return alert("No agentId or chatId is available. Please create a chat first.");
  }

  if (peerConnection && peerConnection.connectionState === 'connected') {
    return;
  }
  stopAllStreams();
  closePC();
  const sessionResponse = await fetchWithRetries(`${DID_API.url}/${DID_API.service}/streams`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${DID_API.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_url: 'https://create-images-results.d-id.com/google-oauth2|111463605347984735376/upl_YKhaIXdurdN6IgzojHTU8/image.png'
    }),
  });

  const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json();
  streamId = newStreamId;
  sessionId = newSessionId;
  try {
    sessionClientAnswer = await createPeerConnection(offer, iceServers);
  } catch (e) {
    console.log('error during streaming setup', e);
    stopAllStreams();
    closePC();
    return;
  }
  // Start stream
  await fetch(`${DID_API.url}/${DID_API.service}/streams/${streamId}/sdp`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${DID_API.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answer: sessionClientAnswer,
      session_id: sessionId,
    }),
  });
};

startButton.onclick = async () => {
  if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
    let txtAreaValue = document.getElementById("textArea").value;
    if (audioChunks.length > 0) {
      const transcription = await transcribeAudio();
      if (transcription.trim() !== '') {
        txtAreaValue = transcription;
      }
      audioChunks.length = 0; // 清空录音数据
    }

    document.getElementById("msgHistory").innerHTML += `<span style='opacity:0.5'><u>User:</u> ${txtAreaValue}</span><br>`;
    document.getElementById("textArea").value = "";

    const playResponse = await fetchWithRetries(`${DID_API.url}/agents/${agentId}/chat/${chatId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "streamId": streamId,
        "sessionId": sessionId,
        "messages": [
          {
            "role": "user",
            "content": txtAreaValue,
            "created_at": new Date().toString()
          }
        ]
      }),
    });
    const playResponseData = await playResponse.json();
    if (playResponse.status === 200 && playResponseData.chatMode === 'TextOnly') {
      console.log('User is out of credit, API only return text messages');
      document.getElementById('msgHistory').innerHTML += `<span style='opacity:0.5'> ${playResponseData.result}</span><br>`;
    }
  }
};

destroyButton.onclick = async () => {
  if (streamId && sessionId) {
    await fetch(`${DID_API.url}/${DID_API.service}/streams/${streamId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${DID_API.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
  }
  stopAllStreams();
  closePC();
};

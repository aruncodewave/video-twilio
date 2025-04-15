'use client'
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { connect, createLocalAudioTrack, createLocalTracks, createLocalVideoTrack } from 'twilio-video';

const VideoCallRoom = ({ token, roomName }) => {
  const [room, setRoom] = useState(null);
  const [isAudioEnabled, setAudioEnabled] = useState(true);
  const [isVideoEnabled, setVideoEnabled] = useState(true);
  const [sid, setSid] = useState(null);
  const localMediaRef = useRef(null);
  const remoteMediaRef = useRef(null);

  useEffect(() => {
    // const joinRoom = async () => {
    //   const localTracks = await createLocalTracks({
    //     audio: true,
    //     video: { width: 640 }
    //   });

    //   localTracks.forEach(track => {
    //     localMediaRef.current.appendChild(track.attach());
    //   });
      
    //   try {
    //     const room = await connect(token, {
    //       name: roomName,
    //       tracks: localTracks
    //     });
    //     debugger
    //     setRoom(room);
    //   } catch (error) {
    //     console.error('Failed to connect to the room:', error);
    //   }

    //   setRoom(room);

    //   if (room) {
    //     if (room.participants) {
    //       room.participants.forEach(participant => {
    //         subscribeToParticipantTracks(participant);
    //       });
    //     }

    //     room.on('participantConnected', participant => {
    //       subscribeToParticipantTracks(participant);
    //     });

    //     room.on('participantDisconnected', participant => {
    //       console.log(`${participant.identity} left`);
    //     });
    //   }
    // };

    const joinRoom = async () => {
      try {
        // Create local audio and video tracks
        const localTracks = await createLocalTracks({
          audio: true,
          video: { width: 640 }
        });
    
        // Create a MediaStream from both tracks
        const mediaStream = new MediaStream(localTracks.map(track => track.mediaStreamTrack));
    
        // Attach to a single video element
        const videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.muted = true; // Mute local preview to prevent echo
        videoElement.srcObject = mediaStream;
    
        // Append to the DOM
        localMediaRef.current.innerHTML = '';
        localMediaRef.current.appendChild(videoElement);
    
        // Connect to Twilio room using the same tracks and enable recording
        const room = await connect(token, {
          name: roomName,
          tracks: localTracks,
          recordParticipantsOnConnect: true // Enable recording for participants on connect
        });
    
        setRoom(room);
    
        // ✅ Log the Room SID and Local Participant SID
        console.log('✅ Connected to Room:');
        console.log('Room SID:', room.sid);
        setSid(room.sid);
        console.log('Local Participant SID:', room.localParticipant.sid);
        try {
          const res = await axios.post('https://81ca-103-181-126-156.ngrok-free.app/composition/video', {
            "roomSid": room.sid
           
          }, {
            headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
            }
          });
          console.log(res.data);
          
          } catch (error) {
          console.error('Error fetching token:', error);
          } 
        // Subscribe to existing participants
        room.participants.forEach(participant => {
          subscribeToParticipantTracks(participant);
        });
    
        // Subscribe to new participants
        room.on('participantConnected', participant => {
          console.log(`${participant.identity} joined`);
          console.log('Participant SID:', participant.sid);
          subscribeToParticipantTracks(participant);
        });
    
        room.on('participantDisconnected', participant => {
          console.log(`${participant.identity} left`);
          console.log('Participant SID:', participant.sid);
          // Optionally clean up
        });
    
      } catch (error) {
        console.error('❌ Failed to connect to the room:', error);
      }
    };
    
    
    
    joinRoom();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [token, roomName]);

  const subscribeToParticipantTracks = (participant) => {
    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        const track = publication.track;
        remoteMediaRef.current.appendChild(track.attach());
      }
    });

    participant.on('trackSubscribed', track => {
      remoteMediaRef.current.appendChild(track.attach());
    });
  };

  const toggleAudio = () => {
    if (!room) return;
    room.localParticipant.audioTracks.forEach(publication => {
      isAudioEnabled ? publication.track.disable() : publication.track.enable();
    });
    setAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    room.localParticipant.videoTracks.forEach(publication => {
      isVideoEnabled ? publication.track.disable() : publication.track.enable();
    });
    setVideoEnabled(!isVideoEnabled);
  };

  const leaveRoom =async () => {
    
    try {
      const res = await axios.post('https://81ca-103-181-126-156.ngrok-free.app/composition/video', {
        "roomSid": sid
       
      }, {
        headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
        }
      });
      console.log(res.data);
      
      } catch (error) {
      console.error('Error fetching token:', error);
      } finally {
      
      }
    if (room) {
      room.disconnect();
      setRoom(null);
    }
  };

  return (
    <div className="video-call-container">
      <h2>Room: {roomName}</h2>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div>
          <h4>Local</h4>
          <div ref={localMediaRef} style={{ width: '300px', height: '200px', background: '#000' }} />
        </div>
        <div>
          <h4>Remote</h4>
          <div ref={remoteMediaRef} style={{ width: '300px', height: '200px', background: '#000' }} />
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={toggleAudio}>
          {isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
        </button>
        <button onClick={toggleVideo} style={{ marginLeft: '1rem' }}>
          {isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
        </button>
        <button onClick={leaveRoom} style={{ marginLeft: '1rem', color: 'red' }}>
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default VideoCallRoom;

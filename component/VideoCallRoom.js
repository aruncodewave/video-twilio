'use client'
import React, { useEffect, useRef, useState } from 'react';
import { connect, createLocalTracks } from 'twilio-video';

const VideoCallRoom = ({ token, roomName }) => {
  const [room, setRoom] = useState(null);
  const [isAudioEnabled, setAudioEnabled] = useState(true);
  const [isVideoEnabled, setVideoEnabled] = useState(true);
  const localMediaRef = useRef(null);
  const remoteMediaRef = useRef(null);

  useEffect(() => {
    const joinRoom = async () => {
      const localTracks = await createLocalTracks({
        audio: true,
        video: { width: 640 }
      });

      localTracks.forEach(track => {
        localMediaRef.current.appendChild(track.attach());
      });
      
      try {
        const room = await connect(token, {
          name: roomName,
          tracks: localTracks
        });
        debugger
        setRoom(room);
      } catch (error) {
        console.error('Failed to connect to the room:', error);
      }

      setRoom(room);

      if (room) {
        if (room.participants) {
          room.participants.forEach(participant => {
            subscribeToParticipantTracks(participant);
          });
        }

        room.on('participantConnected', participant => {
          subscribeToParticipantTracks(participant);
        });

        room.on('participantDisconnected', participant => {
          console.log(`${participant.identity} left`);
        });
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

  const leaveRoom = () => {
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

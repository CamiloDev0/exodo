import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './App.css';

function App() {
  const [screenActive, setScreenActive] = useState(6);
  const [lang, setLang] = useState('');
  const [soundTrack, setSoundTrack] = useState<number[]>([]);
  const [playTrack, setPlayTrack] = useState(0);
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(true);
  const [newPosition, setNewPosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [startConfesion, setStartConfesion] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef: React.MutableRefObject<MediaRecorder | null> = useRef(null);
  
  const videoConstraints = {
    width: 800 ,
    height: 600,
    facingMode: 'user',
  };

  const TYPE_LISTENER = 'dataavailable';

  const renderScreen = ( ) => {
    switch( screenActive ){
      case 0://screen zero [ OK ]
        return(
          <div 
            className={`screen ${ screenActive === 0 && 'active' } zero`}
          >
            <div className="langSelector" onClick={() => setScreenActive(1)} style={{right:'4rem'}}></div>
            <div className="langSelector" onClick={() => {setLang('en'); setScreenActive(1);}} style={{left:'3rem'}}></div>
          </div>
        )
        break;
      case 1://screen one [ OK ]
        return(
          <div 
            className={`screen ${ screenActive === 1 && 'active' } one${lang}`} 
            onClick={() => setScreenActive(2)}
          />
        )
        break;
      case 2://screen two [ OK ]
        return(
          <div
            className={`screen ${ screenActive === 2 && 'active' } two${lang}`}
          >
            <input 
              type="phone" 
              className={`phone ${ !phoneValid && 'shake' }`}
              placeholder='(555) 1234-5678'
              onChange={handleInput}
              ref={inputRef}
              autoFocus={screenActive === 2}
            />
            <div className='go-step-3' onClick={() => handleValidatePhone()}></div>
          </div>
        )
        break;
      case 3://screen three [ OK ]
        return(
          <div
            className={`screen ${ screenActive === 3 && 'active' } three${lang}`}
          >
            <div className="grid-sound-track">
              <div className={`sound-track ${soundTrack.includes(1) && 'track-selected'}`} onClick={() => { handleAddTrack(1); }}></div>
              <div className={`sound-track ${soundTrack.includes(2) && 'track-selected'}`} onClick={() => { handleAddTrack(2); }}></div>
              <div className={`sound-track ${soundTrack.includes(3) && 'track-selected'}`} onClick={() => { handleAddTrack(3); }}></div>
              <div className={`sound-track ${soundTrack.includes(4) && 'track-selected'}`} onClick={() => { handleAddTrack(4); }}></div>
              <div className={`sound-track ${soundTrack.includes(5) && 'track-selected'}`} onClick={() => { handleAddTrack(5); }}></div>
              <div className={`sound-track ${soundTrack.includes(6) && 'track-selected'}`} onClick={() => { handleAddTrack(6); }}></div>
              <div className={`sound-track ${soundTrack.includes(7) && 'track-selected'}`} onClick={() => { handleAddTrack(7); }}></div>
              <div className={`sound-track ${soundTrack.includes(8) && 'track-selected'}`} onClick={() => { handleAddTrack(8); }}></div>
              <div className={`sound-track ${soundTrack.includes(9) && 'track-selected'}`} onClick={() => { handleAddTrack(9); }}></div>
              <div className={`sound-track ${soundTrack.includes(10) && 'track-selected'}`} onClick={() => { handleAddTrack(10); }}></div>
              <div className={`sound-track ${soundTrack.includes(11) && 'track-selected'}`} onClick={() => { handleAddTrack(11); }}></div>
              <div className={`sound-track ${soundTrack.includes(12) && 'track-selected'}`} onClick={() => { handleAddTrack(12); }}></div>
              <div className={`sound-track ${soundTrack.includes(13) && 'track-selected'}`} onClick={() => { handleAddTrack(13); }}></div>
              <div className={`sound-track ${soundTrack.includes(14) && 'track-selected'}`} onClick={() => { handleAddTrack(14); }}></div>
              <div className={`sound-track ${soundTrack.includes(15) && 'track-selected'}`} onClick={() => { handleAddTrack(15); }}></div>
              <div className={`sound-track ${soundTrack.includes(16) && 'track-selected'}`} onClick={() => { handleAddTrack(16); }}></div>
              <div className={`sound-track ${soundTrack.includes(17) && 'track-selected'}`} onClick={() => { handleAddTrack(17); }}></div>
              <div className={`sound-track ${soundTrack.includes(18) && 'track-selected'}`} onClick={() => { handleAddTrack(18); }}></div>
              <div className={`sound-track ${soundTrack.includes(19) && 'track-selected'}`} onClick={() => { handleAddTrack(19); }}></div>
              <div className={`sound-track ${soundTrack.includes(20) && 'track-selected'}`} onClick={() => { handleAddTrack(20); }}></div>
            </div>
            <div className="msn-three">
              {lang === 'en' ? <p>select three soundtracks</p> : <p>selecciona tres soundtracks</p>}
            </div>
          </div>
        )
        break;
      case 4://screen four [ OK ]
        return(
          <div
            className={`screen ${ screenActive === 4 && 'active' } four`}
          >
            <div className="needle"></div>
            <div className="disc"></div>
            <div className={`timeline ${newPosition === 0 && 'timeline-active'} timeline-song-0`} />
            <div className={`timeline ${newPosition === 1 && 'timeline-active'} timeline-song-1`} />
            <div className={`timeline ${newPosition === 2 && 'timeline-active'} timeline-song-2`} />
            <audio autoPlay ref={audioRef} src={`/songs/${playTrack}.mp3`} onEnded={handlePlayTrack}/>
            <div className={`trackSelected bg-${playTrack}`}></div>
          </div>
        )
          break;
      case 5://screen five [ OK ]
        return(
          <div className={`screen ${ screenActive === 5 && 'active' } five${lang}`}>
            <div className={`text-callback ${startConfesion && 'text-callback-inactive'}`} onClick={() => setStartConfesion(!startConfesion)}>
              {lang === 'en' ? <p>touch to start recording</p> : <p>toca para iniciar la grabación</p>}
            </div>
            <div className={`timeline-video ${startConfesion && 'timeline-video-active'}`}></div>
          </div>
        )
        break;
      case 6://Screen six [ OK ]
        return(
          <div
            className={`screen ${ screenActive === 6 && 'active' } six${lang}`}
          />
        )
          break;
      default:
        return(<></>);
        break;
    }
  }

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(event.target.value);
    if(inputRef.current){
      inputRef.current.value = formattedValue;
      setPhone(formattedValue);
    }
  };

  const formatPhoneNumber = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    const trimmedDigits = digits.substring(0, 10);
    const formatted = `(${trimmedDigits.substring(0, 3)}) ${trimmedDigits.substring(3, 6)}-${trimmedDigits.substring(6)}`;
    return formatted;
  };

  const handleValidatePhone = () => {
    const extractPhone = extractNumbersStringManip(phone);
    if( phone !== '' && extractPhone.length >= 10 ){
      setScreenActive(3);
    }else
      setPhoneValid( false );
  }

  const extractNumbersStringManip = (text:string)=> {
    let extractedNumbers = '';
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      if (/\d/.test(char)) {
        extractedNumbers += char;
      }
    }
    return extractedNumbers;
  };

  const handleAddTrack = (track:number) => {
    let arrTracks = [...soundTrack];
    
    if( arrTracks.includes(track) )
      arrTracks = arrTracks.filter(item => item !== track)
    else
      arrTracks.push(track);

    setSoundTrack(arrTracks);
  }
  
  const handlePlayTrack = () => {
    const indexTrack = soundTrack.indexOf(playTrack);
    const position = indexTrack+1
    setPlayTrack(soundTrack[position]);
    
    if(position === 3){
      setScreenActive(5);
      setTimeLeft(15);
    }

    setNewPosition(position);
  }

  const handleRegisterLead = useCallback(async () => {
    const newUniqueId = Math.random().toString(36).substring(7);
    const newHashId = 'Mexico-Exodo-' + newUniqueId;
    const tracks = [
      'Mala',
      'Me Activo', 
      'La Patrulla',
      'Tommy Pamela',
      'Sr. Smith',
      'Put em in the fridge',
      'Mami', 
      'Belanova', 
      'Bruce Wayne', 
      'Hollywood', 
      'Reloj', 
      'Ice', 
      'Solicitado',
      'Santal 33',
      'Vino Tinto',
      '14-14',
      'Pa no pensar'
    ];
    const songsArr = [...soundTrack];
    if(phone !== '' && songsArr.length === 3){
      const songs = songsArr.map(index => tracks[index - 1]).join(', ');
      const url = `https://mocionws.info/dbController.php?method=newRecord&table=leads&name=${songs}&email=${'+1'+phone}&uniqueId=${newHashId}&experience=1`;
      await axios.get(url);
    }
  }, [soundTrack, phone]);

  const handleDataAvailable = useCallback(({
    data,
  }: MediaRecorderEventMap['dataavailable']) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  }, []);

  const handleStartCaptureClick = useCallback(() => {
    console.log("IN START RECORD");
    if (webcamRef.current && webcamRef.current.stream) {
      console.log("Start Recording");
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm;codecs=vp9',
      });
      mediaRecorderRef.current.addEventListener(
        TYPE_LISTENER,
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    }
  }, [handleDataAvailable]);

  const handleStopCaptureClick = () => {
    console.log("IN STOP RECORD");
    if (mediaRecorderRef.current) {
      console.log("Stop Recording");
      mediaRecorderRef.current.stop();
    }
  };

  // const handleDownload = useCallback(() => {
  //   console.log("In DOWNLOAD");
  //   if (recordedChunks.length) {
  //     console.log("Start Downloading");
  //     const blob = new Blob(recordedChunks, {
  //       type: 'video/webm',
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     document.body.appendChild(a);
  //     a.href = url;
  //     a.download = 'react-webcam-stream-capture.webm';
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   }
  // }, [recordedChunks]);

  const uploadFileRequest = useCallback(async (fileName: string) => {
    console.log("IN UPLOAD", recordedChunks.length);
    if (recordedChunks.length) {
      console.log("Start uploading");
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      // Obtener el tamaño del archivo en MB
      const fileSizeInMB = blob.size / (1024 * 1024);
      console.log(`File size: ${fileSizeInMB.toFixed(2)} MB`);
      const data = new FormData();
      data.append('videoFile', blob, fileName);
      const _heads = {
        'Content-Type': `multipart/form-data;`,
      };
      try {
        const res = await axios.post(
          'https://mocionws.info/video.php',
          data,
          { headers: _heads }
        );
        console.log('UPLOAD VIDEO', res);
        if (res.data !== 'error'){
          setRecordedChunks([]);
          if(startConfesion) setScreenActive(6);
        }
      } catch (error) {
        console.log('ERROR UPLOAD VIDEO', error);
      }
    }
  }, [recordedChunks, startConfesion]);

  useEffect(() => {
    if(soundTrack.length === 3){
      setPlayTrack(soundTrack[0]);
      setScreenActive(4);
    }
  }, [soundTrack]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;

    if (screenActive === 6) {
      timer = setTimeout(() => {
        setLang('');
        setSoundTrack([]);
        setPlayTrack(0);
        setPhone('');
        setPhoneValid(true);
        setNewPosition(0);
        setTimeLeft(15);
        setScreenActive(0);
        setStartConfesion(false);
      }, 10000); // 5 segundos
    }else if(screenActive === 4)
      handleRegisterLead();

    return () => {
      if (timer) clearTimeout(timer); // Limpiar el temporizador al desmontar
    };
  }, [screenActive, handleRegisterLead]);

  useEffect(() => {
    console.log("Play Track", newPosition)
    if(newPosition === 2 || startConfesion){
      handleStartCaptureClick(); 
    }
  }, [webcamRef.current?.stream, handleStartCaptureClick, newPosition, startConfesion]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;

    if (timeLeft === null) return;

    if (timeLeft === 0) {
      handleStopCaptureClick();
      const nameFile = extractNumbersStringManip(phone);
      const comp = startConfesion ? 'C' : 'R';
      uploadFileRequest(nameFile+'-'+comp);
      //handleDownload();
      return;
    }

    if(newPosition === 2 || startConfesion){
      timer = setTimeout(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    }
    
  }, [timeLeft, phone, uploadFileRequest, newPosition, startConfesion]);

  return (
    <div className="container">
      {renderScreen()}
      {screenActive >= 3 &&
      <div className='webcam-container' style={{zIndex:screenActive === 5 ? '1' : '-1'}}>
        <Webcam
          width={'100%'}
          height={'100%'}
          style={{ objectFit: 'fill' }}
          audio
          ref={webcamRef}
          videoConstraints={videoConstraints}
          audioConstraints
        />
      </div>
      }
    </div>
  )
}

export default App
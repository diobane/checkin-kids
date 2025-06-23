import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styles from '../styles/Home.module.css';
import { CircularProgress, SvgIcon } from '@mui/material';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8z7o85SIHOHNWHai02QaiQE-hwVTIxnPnhTX4wawwcj0d7tk0wM_xyAOhgMWb3RycPw/exec';

export default function Home() {
  const [status, setStatus] = useState('WAITING');
  const [message, setMessage] = useState('Aguardando leitura...');

  useEffect(() => {
    function onScanSuccess(decodedText: string) {
      html5QrcodeScanner.pause();

      setStatus('REGISTERING');
      setMessage(`Registrando presença para ID: ${decodedText}`);

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: JSON.stringify({ id: decodedText }),
      })
        .then((res) => res.json())
        .then((data) => {
          setMessage(data.message);
          setStatus(data.status === 'success' ? 'SUCCESS' : 'ERROR');
        })
        .catch((error) => {
          setStatus('ERROR');
          setMessage('Erro ao conectar com o servidor.');
        })
        .finally(() => {
          setTimeout(() => {
            html5QrcodeScanner.resume();
            setStatus('WAITING');
            setMessage('Aguardando leitura...');
          }, 3000);
        });
    }

    function onScanError(_errorMessage: string) {
      //...
    }

    const html5QrcodeScanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
    }, false);

    html5QrcodeScanner.render(onScanSuccess, onScanError);
  }, []);

  return (
    <>
      <Head>
        <title>Leitor de Presença</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.container}>
        <h1></h1>
        <div id="qr-reader" className={styles.qrBox}></div>
        <div id="result" className={styles.result}>

          { status === "WAITING" && 
            <div className={styles.waiting}>
              <span>{ message }</span>
            </div>
          }

          { status === "REGISTERING" && 
            <div className={styles.registering}>
              <CircularProgress thickness={5} color='inherit' size={50}/>
              <span>{ message }</span>
            </div>
          }

          { status === "SUCCESS" && 
            <div className={styles.success}>
              <svg width="71" height="71" viewBox="0 0 71 71" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35.5" cy="35.5" r="35.5" fill="#D5EBDE"/>
                <path d="M29.9098 49L20 35.7455L22.2869 33.2909L30.418 38.6909C34.4836 32.4073 43.1229 24.9455 46.9344 22H51C40.6328 32.0145 32.6202 44.1727 29.9098 49Z" fill="#5DA277"/>
              </svg>
              <span>{ message }</span>
            </div>
          }

          { status === "ERROR" && 
            <div className={styles.error}>
              <svg width="71" height="71" viewBox="0 0 71 71" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35.5" cy="35.5" r="35.5" fill="#FFC1CE"/>
                <path d="M24.5854 47L48 24M24 24L47.4146 47" stroke="#93344A" stroke-width="5" stroke-linecap="round"/>
              </svg>
              <span>{ message }</span>
            </div>
          }
        </div>
      </main>
    </>
  );
}
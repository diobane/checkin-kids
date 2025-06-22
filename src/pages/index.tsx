import { useEffect } from 'react';
import Head from 'next/head';
import { Html5QrcodeScanner } from 'html5-qrcode';
import styles from '../styles/Home.module.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxBMewrE3OWPOa87Hk0nmstJp2Dk44yRs7O73unl7w3COEjjFsJy_O9rIiCNRbwQlt0vQ/exec'; // <<<--- IMPORTANTE!

export default function Home() {
  useEffect(() => {
    const resultDiv = document.getElementById('result') as HTMLDivElement;

    function onScanSuccess(decodedText: string) {
      html5QrcodeScanner.pause();
      resultDiv.innerHTML = `Registrando presença para ID: ${decodedText}...`;
      resultDiv.className = '';

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: JSON.stringify({ id: decodedText }),
      })
        .then((res) => res.json())
        .then((data) => {
          resultDiv.innerHTML = data.message;
          if (data.status === 'success') {
            resultDiv.className = styles.success;
            navigator.vibrate?.(200);
          } else {
            resultDiv.className = styles.error;
            navigator.vibrate?.([100, 50, 100]);
          }
        })
        .catch((error) => {
          console.error('Erro:', error);
          resultDiv.innerHTML = 'Erro ao conectar com o servidor.';
          resultDiv.className = styles.error;
        })
        .finally(() => {
          setTimeout(() => {
            html5QrcodeScanner.resume();
            resultDiv.innerHTML = 'Aguardando leitura...';
            resultDiv.className = '';
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
        <div id="result" className={styles.result}>Aguardando leitura...</div>
      </main>
    </>
  );
}
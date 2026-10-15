# Tra noi

Diario per due persone, con contenuti conservati localmente nel browser.

Questo repository contiene soltanto HTML, CSS, JavaScript, icone generiche e librerie QR incluse localmente. Nessun profilo personale o ricordo è preconfigurato. Pubblicare con GitHub Pages dalla cartella radice del branch main, senza build.

Il primo avvio con Internet prepara la copia offline. Su iPhone aggiungere alla Home e aprire la nuova icona prima di inserire dati. Il sito pubblico non rende pubblici i diari salvati sui singoli dispositivi. Il browser e l’hosting restano parti fidate dell’app: aggiornare solo da sorgenti controllate. GitHub registra le normali richieste del sito, inclusi gli indirizzi IP, ma non riceve automaticamente i contenuti del diario.

Lo scambio WebRTC con QR è sperimentale e richiede stessa rete, diari aperti e verifica sui dispositivi reali. Nessun server di segnalazione, STUN/TURN esterno o telemetria è configurato. Il QR contiene parametri di connessione temporanei, non foto o ricordi.

Backup manuale: esportazione JSON locale completa e importazione compatibile con versioni precedenti. Copiare il file sul Mac senza caricarlo in questo repository. Archivio non cifrato dall’app, importazione attuale massima 150 MB. Non cancellare la web app o i dati del browser senza un backup. I backup del sistema operativo/iCloud dipendono dalle impostazioni del dispositivo.

La selezione Persona 1/Persona 2 identifica il ruolo nel diario locale, non è un’autenticazione online. Sullo stesso dominio, altre applicazioni dello stesso proprietario possono condividere l’origine browser: usare solo codice fidato sull’intero dominio.

Librerie: qrcode-generator 2.0.4 (MIT), jsQR 1.4.0 (Apache-2.0), con licenze in vendor/.

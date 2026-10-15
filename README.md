# Tra noi

Diario per due persone, con contenuti conservati localmente nel browser.

Questo repository contiene soltanto HTML, CSS, JavaScript, icone generiche e librerie QR incluse localmente. Nessun profilo personale o ricordo è preconfigurato. Pubblicare con GitHub Pages dalla cartella radice del branch main, senza build.

Il primo avvio con Internet prepara la copia offline. Su iPhone aggiungere alla Home e aprire la nuova icona prima di inserire dati. Il sito pubblico non rende pubblici i diari salvati sui singoli dispositivi. Il browser e l’hosting restano parti fidate dell’app: aggiornare solo da sorgenti controllate. GitHub registra le normali richieste del sito, inclusi gli indirizzi IP, ma non riceve automaticamente i contenuti del diario.

Lo scambio WebRTC con QR è sperimentale e richiede stessa rete, diari aperti e verifica sui dispositivi reali. Nessun server di segnalazione, STUN/TURN esterno o telemetria è configurato. Il QR contiene parametri di connessione temporanei, non foto o ricordi.

Persona 1 configura l'amministrazione sul proprio telefono, scegliendo una password locale di almeno 10 caratteri. La chiave amministratore viene conservata cifrata; lo sblocco dura per l'apertura corrente. I nomi e le foto si inseriscono nel profilo, senza modificare il codice pubblico. Persona 2 può modificare il proprio profilo; le modifiche al profilo amministratore e quelle fatte dall'amministratore all'altro profilo richiedono firme verificate prima del salvataggio. L'autorità viene ricevuta al collegamento QR iniziale e non può essere sostituita con quella di un altro diario. Gli altri contenuti restano condivisi: i permessi di profilo non costituiscono un sistema di login online o una protezione contro il proprietario del dispositivo che modifica il codice.

Backup manuale: l'amministratore sbloccato esporta JSON v4 con tutti i contributi presenti e la chiave di recupero protetta dalla stessa password. Sincronizzare prima i due iPhone, poi esportare dal telefono principale e trasferire il file sul Mac tramite le funzioni del sistema. Il Mac conserva soltanto file e non necessita di un account attivo o di un server. L'importazione su ogni iPhone conserva il ruolo assegnato a quel dispositivo; Persona 2 non conserva la chiave di recupero nell'archivio dell'app. Un backup di una coppia diversa viene rifiutato. Il ripristino aggiunge i dati mancanti; non annulla modifiche successive già presenti. Le vecchie copie sono importabili se compatibili con i permessi già configurati.

Non caricare i backup in questo repository. La password protegge la chiave amministratore, non l'intero archivio JSON: foto e testi nel file sono leggibili. Non c'è recupero della password attraverso un servizio. Importazione attuale massima 150 MB. Non cancellare la web app o i dati del browser senza un backup. I backup del sistema operativo/iCloud dipendono dalle impostazioni del dispositivo.

La selezione Persona 1/Persona 2 identifica il ruolo nel diario locale, non è un’autenticazione online. Sullo stesso dominio, altre applicazioni dello stesso proprietario possono condividere l’origine browser: usare solo codice fidato sull’intero dominio.

Librerie: qrcode-generator 2.0.4 (MIT), jsQR 1.4.0 (Apache-2.0), con licenze in vendor/.

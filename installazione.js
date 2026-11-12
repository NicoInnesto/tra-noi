'use strict';

// Some home-screen installs can reopen the guide URL instead of the manifest start URL.
if(navigator.standalone===true||matchMedia('(display-mode: standalone)').matches){
 location.replace('./?icona=infinito');
}

/// <reference path="globals/angular/index.d.ts" />
/// <reference path="globals/core-js/index.d.ts" />
/// <reference path="globals/jquery/index.d.ts" />
/// <reference path="globals/socket.io-client/index.d.ts" />

declare var Snarl;
declare var socket;
interface Window {
   startApp;
   addNewNewMessage;
   deleteNewMessages;
   arrayContains;
   clientList;
   isLoggedIn;
   socket;
   imageUrl;
}

interface HTMLElement {
   reset;
}

interface String {
   htmlToString;
}
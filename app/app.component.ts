/// <reference path="../typings/index.d.ts" />
import {Component, ViewChildren, ElementRef, AfterViewInit, NgZone} from '@angular/core';

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html'
})

export class AppComponent implements AfterViewInit {
    loggedIn = false;
    username = '';
    newMessages = 0;
    chatMessage = '';
    loginRequest;
    logOut;
    googleSignIn;
    zone: NgZone;
    constructor(zone: NgZone) {
        this.zone = zone;
    }
    ngAfterViewInit() {
        window.startApp();
        let componentZone = this.zone;
        let component = this;
        window.addNewNewMessage = function () {
            componentZone.run(() => {
                component.newMessages += 1;
            });
        }
        window.deleteNewMessages = function () {
            componentZone.run(() => {
                component.newMessages = 0;
            });
        }
        window.googleSignIn = function(name, imageUrl) {
            componentZone.run(() => {
                window.socket.emit('user request', {name: name, imageUrl: imageUrl});
                component.loggedIn = true;
                window.isLoggedIn = true;
                window.name = name;
                window.imageUrl = imageUrl;
                $('#messages').text('');
            });
        }
        this.loginRequest = function () {
            if (this.username === '' || this.username === null || this.username.length > 10 || this.username === undefined) {
                Snarl.addNotification({
                    title: 'Please enter a valid username.',
                    icon: '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>'
                });
                this.username = '';
            }
            else if (window.arrayContains(window.clientList, this.username)) {
                Snarl.addNotification({
                    title: 'Username already exists.',
                    text: 'Please choose another one.',
                    icon: '<i class="fa fa-times-circle" aria-hidden="true"></i>'
                });
                this.username = '';
            }
            else if (window.socket.connected === false) {
                Snarl.addNotification({
                    title: 'Sorry, could not connect to server.',
                    text: 'Please try again later.',
                    icon: '<i class="fa fa-spinner" aria-hidden="true"></i>'
                });
                this.username = '';
            }
            else {
                window.socket.emit('user request', {name: this.username, imageUrl: ''});
                this.loggedIn = true;
                window.isLoggedIn = true;
                window.name = this.username;
                $('#messages').text('');
            }
        };
        this.logOut = function () {
            window.socket.emit('logout', window.name);
            window.name = '';
            this.loggedIn = false;
            window.isLoggedIn = false;
            window.imageUrl = undefined;
            gapi.auth2.getAuthInstance().signOut();
            this.username = '';
            this.chatMessage = '';
            setTimeout(function () {
                $('#messages').text('');
            }, 20);
            $('#loginForm')[0].reset();
        };
    }
}
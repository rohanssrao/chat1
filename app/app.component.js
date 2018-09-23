"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/// <reference path="../typings/index.d.ts" />
var core_1 = require('@angular/core');
var AppComponent = (function () {
    function AppComponent(zone) {
        this.loggedIn = false;
        this.username = '';
        this.newMessages = 0;
        this.chatMessage = '';
        this.zone = zone;
    }
    AppComponent.prototype.ngAfterViewInit = function () {
        window.startApp();
        var componentZone = this.zone;
        var component = this;
        window.addNewNewMessage = function () {
            componentZone.run(function () {
                component.newMessages += 1;
            });
        };
        window.deleteNewMessages = function () {
            componentZone.run(function () {
                component.newMessages = 0;
            });
        };
        window.googleSignIn = function (name, imageUrl) {
            componentZone.run(function () {
                window.socket.emit('user request', { name: name, imageUrl: imageUrl });
                component.loggedIn = true;
                window.isLoggedIn = true;
                window.name = name;
                window.imageUrl = imageUrl;
                $('#messages').text('');
            });
        };
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
                window.socket.emit('user request', { name: this.username, imageUrl: '' });
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
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: 'app/app.component.html'
        }), 
        __metadata('design:paramtypes', [core_1.NgZone])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map
/// <reference path="../typings/index.d.ts" />

window.startApp = function() {

    $('body').append('<script src="https://apis.google.com/js/platform.js" async defer><\/script>');

    window.onbeforeunload = function(e){
        gapi.auth2.getAuthInstance().signOut();
    };

    var titleText = $('title').text();

    String.prototype.htmlToString = function() {
        return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    window.arrayContains = function (array, obj) {
        for (var index in array) {
            if (array[index] === obj) {
                return true;
            }
        }
        return false;
    };
    var scrollToMessage = function (scrolled, isOwnSender = false) {
        if (scrolled) {
            $('#chat').animate({
                scrollTop: $('#chat')[0].scrollHeight
            }, {
                duration: 1000,
                queue: false,
                progress: (() => {
                    if ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) {
                        $('#chat').stop(false, true);
                    }
                })
            });
        }
        else if (!isOwnSender) {
            window.addNewNewMessage();
        }
    };
    var docUrl = (document.location.href.endsWith('index.html')) ? document.location.href.replace('index.html', '') : document.location.href;
    window.socket = io.connect(docUrl);
    var typing = false;
    var timeout;
    window.clientList;
    var sessionid;
    window.name = '';
    var scrollAtBottom;
    function imageUrl(url) {
        if ((/\.(gif|jpg|jpeg|tiff|png|ico)$/i).test(url)) {
            return true;
        }
        else {
            return false
        }
    }
    function isYouTube(url) {
        if (url !== undefined || url !== '') {
            let match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]{11})$/);
            if (match) {
                return 'https://www.youtube.com/embed/' + match[2] + '?autoplay=0';
            } else {
                return 'no';
            }
        } else {
            return 'no';
        }
    }
    function flashTitle(name) {
        if (window.isLoggedIn) {
            $('title').text('New message from ' + name);
            setTimeout((() => {
                $('title').text(titleText);
            }), 1500);
        }
    }
    function currentTime() {
        function pad(n) {
            return (n < 10) ? '0' + n : n;
        }
        var time = new Date();
        var hours = time.getHours();
        var minutes = time.getMinutes();
        var seconds = time.getSeconds();
        var amPm = 'am';
        if (hours > 12) {
            hours -= 12;
            amPm = 'pm';
        }
        else if (hours === 0) {
            hours = 12;
        }
        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) + ' ' + amPm;
    }
    var interval = setInterval((() => {
        if (window.socket.connected === false) {
            console.log('couldn\'t connect, retrying');
            $('#enterMessage').attr('disabled', 'disabled');
            $('#submitMessage').attr('disabled', 'disabled');
            $('#submitMessage').addClass('disabled');
            $('#enterMessage').css('cursor', 'not-allowed');
            $('#submitMessage').css('cursor', 'not-allowed');
        }
        else {
            $('#enterMessage').removeAttr('disabled');
            $('#submitMessage').removeAttr('disabled');
            $('#submitMessage').removeClass('disabled');
            $('#enterMessage').css('cursor', 'text');
            $('#submitMessage').css('cursor', 'pointer');
            clearInterval(interval);
        }
    }), 350);

    $('#uploadImage').change(function(e) {
        var file = e.originalEvent.target.files[0];
        if (!file.type.startsWith('image') || file.size > 5000000) {return false;}
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(evt){
            scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
            if (window.imageUrl) {
                $('#messages').append($('<li class="rightAlign">').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + evt.target.result + '" /> - <span style="color: rgb(255, 99, 0)">you</span>, ' + currentTime() + '<img title="Google sign-in" class="profilePic" src="' + window.imageUrl + '">'));
            } else {
                $('#messages').append($('<li class="rightAlign">').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + evt.target.result + '" /> - <span style="color: rgb(255, 99, 0)">you</span>, ' + currentTime()));                
            }
            window.socket.emit('message', { imageUrl: window.imageUrl, type: 'imageFile', content: evt.target.result, name: name, time: currentTime() });
            scrollToMessage(scrollAtBottom, true);
        };
    })

    $('#enterMessage')[0].onpaste = function(event){
        var items = (event.clipboardData  || event.originalEvent.clipboardData).items;
        var blob = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === 0) {
                blob = items[i].getAsFile();
            }
        }
        if (blob !== null) {
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function(evt) {
                scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
                if (window.imageUrl) {
                    $('#messages').append($('<li class="rightAlign">').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + evt.target.result + '" /> - <span style="color: rgb(255, 99, 0)">you</span>, ' + currentTime() + '<img title="Google sign-in" class="profilePic" src="' + window.imageUrl + '">'));
                } else {
                    $('#messages').append($('<li class="rightAlign">').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + evt.target.result + '" /> - <span style="color: rgb(255, 99, 0)">you</span>, ' + currentTime()));
                }
                window.socket.emit('message', { imageUrl: window.imageUrl, type: 'imageFile', content: evt.target.result, name: name, time: currentTime() });
                scrollToMessage(scrollAtBottom, true);
            };
        }
    }

    $('#enterMessage').focus();

    $('#chatForm').submit((() => {
        
        let todisplay = currentTime();

        if ($('#enterMessage').val() !== '') {
            var url;
            var text = $('#enterMessage').val();
            text = text.htmlToString();
            url = (text.startsWith('http://') === false && text.startsWith('https://') === false) ? 'http://' + text : text;
            if (imageUrl(url)) {
                scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
                if (window.imageUrl) {
                    $('#messages').append($('<li class="rightAlign">').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + url + '" /> - <span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay + '<img title="Google sign-in" class="profilePic" src="' + window.imageUrl + '">'));
                } else {
                    $('#messages').append($('<li class="rightAlign">').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + url + '" /> - <span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay));
                }
                var img = $('#messages li:last-child img');
                scrollToMessage(scrollAtBottom, true);
                img.on('error', function() {
                    window.socket.emit('message', { imageUrl: window.imageUrl, type: 'text', content: text, name: name, time: todisplay });
                    if (window.imageUrl) {
                        $('#messages li:last-child').html(text + ' - ' + '<span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay + '<img title="Google sign-in" class="profilePic" src="' + window.imageUrl + '">');
                    } else {
                        $('#messages li:last-child').html(text + ' - ' + '<span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay);
                    }
                });
                img.on('load', function() {
                    window.socket.emit('message', { imageUrl: window.imageUrl, type: 'image', content: url, name: name, time: todisplay });
                });
            }
            else if (isYouTube(url) !== 'no') {
                window.socket.emit('message', { imageUrl: window.imageUrl, type: 'video', content: url, name: name, time: todisplay });
                scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
                if (window.imageUrl) {
                    $('#messages').append($('<li class="rightAlign">').html('<iframe style="margin: 10px;" src="' + isYouTube(url) + '" /> - ' + '<span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay + '<img title="Google sign-in" class="profilePic" src="' + window.imageUrl + '">'));
                } else {
                    $('#messages').append($('<li class="rightAlign">').html('<iframe style="margin: 10px;" src="' + isYouTube(url) + '" /> - ' + '<span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay));
                }
                scrollToMessage(scrollAtBottom, true);
            }
            else {
                window.socket.emit('message', { imageUrl: window.imageUrl, type: 'text', content: text, name: name, time: todisplay });
                scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
                if (window.imageUrl) {
                    $('#messages').append($('<li class="rightAlign">').html(text + ' - ' + '<span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay + '<img title="Google sign-in" class="profilePic" src="' + window.imageUrl + '">'));
                } else {
                    $('#messages').append($('<li class="rightAlign">').html(text + ' - ' + '<span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay));
                }
                scrollToMessage(scrollAtBottom, true);
            }
            $('#enterMessage').val('');
            window.socket.emit('typing', false);
        }
        return false;
    }));
    window.socket.on('message', function (data) {
        flashTitle(data.name);
        switch (data.type) {
            case "text":
                scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
                if (data.imageUrl) {
                    $('#messages').append($('<li>').html(data.content + ' - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time + '<img title="Google sign-in" class="profilePic" src="' + data.imageUrl + '">'));
                } else {
                    $('#messages').append($('<li>').html(data.content + ' - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time));                    
                }
                scrollToMessage(scrollAtBottom);
            break;
            case "image":
                scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
                if (data.imageUrl) {
                    $('#messages').append($('<li>').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + data.content + '" /> - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time + '<img title="Google sign-in" class="profilePic" src="' + data.imageUrl + '">'));
                } else {
                    $('#messages').append($('<li>').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + data.content + '" /> - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time));
                }
                scrollToMessage(scrollAtBottom);
            break;
            case "video":
                scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
                if (data.imageUrl) {
                    $('#messages').append($('<li>').html('<iframe style="margin: 10px;" src="' + isYouTube(data.content) + '" /> - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time + '<img title="Google sign-in" class="profilePic" src="' + data.imageUrl + '">'));
                } else {
                    $('#messages').append($('<li>').html('<iframe style="margin: 10px;" src="' + isYouTube(data.content) + '" /> - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time));
                }
                scrollToMessage(scrollAtBottom);
            break;
            case "imageFile":
                scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
                if (data.imageUrl) {
                    $('#messages').append($('<li>').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + data.content + '" /> - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time + '<img title="Google sign-in" class="profilePic" src="' + data.imageUrl + '">'));
                } else {
                    $('#messages').append($('<li>').html('<img style="margin: 10px; max-width: 30vw; max-height: 70vh;" src="' + data.content + '" /> - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time));
                }
                scrollToMessage(scrollAtBottom);
        }
    });
    window.socket.on('client count', function (numClients) {
        if (numClients === 1) {
            $('header').html(numClients + ' user<br>online:');
        }
        else {
            $('header').html(numClients + ' users<br>online:');
        }
    });
    window.socket.on('client list', function (list) {
        window.clientList = Object.keys(list);
        var i;
        $('#online').html('');
        if (name !== '') {
            if (window.imageUrl) {
                $('#online').append('<li style="color: rgb(255, 99, 0)">you (' + name + ')' + '<img title="Google sign-in" class="profilePic" src="' + window.imageUrl + '">');
            } else {
                $('#online').append('<li style="color: rgb(255, 99, 0)">you (' + name + ')');
            }
        }
        for (i in Object.keys(list)) {
            if (Object.keys(list)[i] !== name) {
                if (list[Object.keys(list)[i]] !== '') {
                    $('#online').append('<li>' + Object.keys(list)[i] + '<img title="Google sign-in" class="profilePic" src="' + list[Object.keys(list)[i]] + '">');
                } else {
                    $('#online').append('<li>' + Object.keys(list)[i]);
                }
            }
        }
    });
    window.socket.on('userDisconnect', function (username) {
        $('#messages').append($('<li style="color: #C0C0C0">').text(username + ' has left'));
    });
    window.socket.on('userConnect', function (username) {
        if (username !== name) {
            $('#messages').append($('<li style="color: #919191">').text(username + ' has joined'));
        }
    });
    window.socket.on('userTyping', function (user) {
        if (user !== false) {
            if (user !== name) {
                $('#whosTyping').text(user + ' is typing');
            }
        }
        else {
            $('#whosTyping').text('');
        }
    });
    $('#enterMessage').keydown(function (e) {
        if (e.which !== 13) {
            typing = true;
            window.socket.emit('typing', name);
            clearTimeout(timeout);
            timeout = setTimeout((() => {
                typing = false;
                window.socket.emit('typing', false);
            }), 2000);
        }
        if (e.which === 13) {
            clearTimeout(timeout);
            typing = false;
            window.socket.emit('typing', false);
        }
    });
    $('#chat').scroll((() => {
        if ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) {
            window.deleteNewMessages();
        }
    }));
};
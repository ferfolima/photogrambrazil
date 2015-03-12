var express = require("express");
var app = express();
var port = process.env.PORT || 3700;
var io = require('socket.io').listen(app.listen(port));
var Instagram = require('instagram-node-lib');
var http = require('http');
var url = require('url')
var request = ('request');
var intervalID;

/**
 * Set the paths for your files
 * @type {[string]}
 */
var pub = __dirname + '/public',
    view = __dirname + '/views';

/**
 * Set the 'client ID' and the 'client secret' to use on Instagram
 * @type {String}
 */
var clientID = '159e54fed6354cacae99784052811c29',
    clientSecret = '39169f06d11a46798ce098db118c5aa7',
    hashtag = '',
    tagid = '';

/**
 * Set the configuration
 */
Instagram.set('client_id', clientID);
Instagram.set('client_secret', clientSecret);
Instagram.set('callback_url', 'http://test-gram.herokuapp.com/callback');
Instagram.set('redirect_uri', 'http://test-gram.herokuapp.com/');
Instagram.set('maxSockets', 10);

/**
 * Uses the library "instagram-node-lib" to Subscribe to the Instagram API Real Time
 * with the tag "hashtag" lollapalooza
 * @type {String}
 */


// if you want to unsubscribe to any hashtag you subscribe
// just need to pass the ID Instagram send as response to you
//Instagram.subscriptions.unsubscribe({ id: '3668016' });

// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function () {
  io.set("transports", [
    'websocket'
    , 'xhr-polling'
    , 'flashsocket'
    , 'htmlfile'
    , 'jsonp-polling'
  ]);
  io.set("polling duration", 10);
});

/**
 * Set your app main configuration
 */
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(pub));
    app.use(express.static(view));
    app.use(express.errorHandler());
    app.set('view engine', 'jade');
    app.use('/subscribe', express());
});


/**
 * Render your index/view "my choice was not use jade"
 */
app.get("/views", function(req, res){
    res.render("index.jade");
});

app.get("/slideshow", function(req, res){
    res.render("slideshow.jade");
});

// check subscriptions
// https://api.instagram.com/v1/subscriptions?client_secret=YOUR_CLIENT_ID&client_id=YOUR_CLIENT_SECRET

/**
 * Needed to receive the handshake
 */
app.get('/callback', function(req, res){
    var handshake =  Instagram.subscriptions.handshake(req, res);
});

app.get('/subscribe', function(req, res) {
    var self = this;
    var parsedRequest;
    parsedRequest = url.parse(req.url, true);
    if (parsedRequest['query']['hub.tag'] != null && parsedRequest['query']['hub.tag'].length > 0) {
        self.hashtag = parsedRequest['query']['hub.tag'];
        Instagram.subscriptions.subscribe({
            object: 'tag',
            object_id: self.hashtag,
            aspect: 'media',
            callback_url: 'http://test-gram.herokuapp.com/callback',
            type: 'subscription',
            id: '#'
        });

        io.sockets.once('connection', function (socket) {
            Instagram.tags.recent({
                name: self.hashtag,
                complete: function(data) {
                    socket.emit('firstShow', { firstShow: data });
                }
            });
        });
    }
    res.redirect('http://test-gram.herokuapp.com');
    return res.end();
});

app.get('/unsubscribe', function(req, res) {
    var self = this;
    //var tagid, parsedRequest;
    //parsedRequest = url.parse(req.url, true);
    //if (parsedRequest['query']['hub.tagid'] != null && parsedRequest['query']['hub.tagid'].length > 0) {
    //    tagid = parsedRequest['query']['hub.tagid'];
    //    Instagram.subscriptions.unsubscribe({ id: tagid });
    //}
    //res.redirect('http://test-gram.herokuapp.com');
    //return res.end();
    //console.log("\n\n\n" + self.tagid + "\n\n\n");
    Instagram.subscriptions.unsubscribe({
        object: 'tag',
        id: self.tagid
    });
    res.redirect('http://test-gram.herokuapp.com');
    return res.end();
});
/**
 * for each new post Instagram send us the data
 */
app.post('/callback', function(req, res) {
    var self = this;
    var data = req.body;

    // Grab the hashtag "tag.object_id"
    // concatenate to the url and send as a argument to the client side
    data.forEach(function(tag) {
      self.tagid = tag.subscription_id;
      var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id=' + clientID;
      sendMessage(url);

    });
    res.end();
});

app.post('/insert', function(req, res){
    var data = req.body;
    io.sockets.emit('insert', data);
    res.end();
});

app.post('/remove', function(req, res){
    var data = req.body;
    io.sockets.emit('remove', data);
    res.end();
});
/**
 * Send the url with the hashtag to the client side
 * to do the ajax call based on the url
 * @param  {[string]} url [the url as string with the hashtag]
 */
function sendMessage(url) {
  io.sockets.emit('show', { show: url });
}

console.log("Listening on port " + port);

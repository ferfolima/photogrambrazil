var express = require("express");
// var wwwhisper = require('connect-wwwhisper');
var app = express();
var port = process.env.PORT || 3700;
var io = require('socket.io').listen(app.listen(port));
var Instagram = require('instagram-node-lib');
var http = require('http');
var url = require('url')
var knox = require('knox');
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
    hashtag = '';
    subscription = {};

var client = knox.createClient({
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET_NAME
});

var dictTagId = {};

/**
 * Set the configuration
 */
Instagram.set('client_id', clientID);
Instagram.set('client_secret', clientSecret);
Instagram.set('callback_url', 'http://photogrambrazil.herokuapp.com/callback');
Instagram.set('redirect_uri', 'http://photogrambrazil.herokuapp.com/');
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
    // app.use(wwwhisper(false));
    //access /auth/logout to logout
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(pub));
    app.use(express.static(view));
    app.use("/images/propaganda", express.static(__dirname + "/public/images/propaganda"));
    app.use("/images/propaganda", express.directory(__dirname + "/public/images/propaganda"));
    app.use(express.errorHandler());
    app.set('view engine', 'jade');
    app.use('/subscribe', express());
});


/**
 * Render your index/view "my choice was not use jade"
 */
app.get("/", function(req, res){
    res.render("index.jade");
});

app.get(/^\/(mainapp|secondaryapp|teatrogazeta|iguana)\/upload/, function (req, res) {
  var src = req.query.src;
  console.log('src: ' + src);

  var options = {
    host: url.parse(src).host,
    port: 80,
    path: url.parse(src).pathname
  };

  var filename = url.parse(src).pathname.split('/').pop();

  http.get(options, function(response) {
    var request = client.put(req.params[0] + "/" + filename, {
      'Content-Length': response.headers['content-length'],
      'Content-Type': response.headers['content-type']
    });

    response.on('data', function(data) {
      request.write(data);
    }).on('end', function() {
      request.end();
    });

    request.on('response', function(resp) {
      console.log('S3 status:', resp.statusCode, 'url:', request.url);
      res.send(request.url);
    });

    request.on('error', function(err) {
      console.error('Error uploading to s3:', err);
      res.send("Error uploading to s3");
    });

  });

});

app.get(/^\/(mainapp|secondaryapp|teatrogazeta|iguana)\/slideshow/, function(req, res){
    res.render(req.params[0] + "/slideshow.jade");
});

// check subscriptions
// https://api.instagram.com/v1/subscriptions?client_secret=YOUR_CLIENT_ID&client_id=YOUR_CLIENT_SECRET

/**
 * Needed to receive the handshake
 */
app.get('/callback', function(req, res){
    var handshake =  Instagram.subscriptions.handshake(req, res);
});

app.get(/^\/(mainapp|secondaryapp|teatrogazeta|iguana)\/subscribe/, function(req, res) {
    var parsedRequest = url.parse(req.url, true);

    if (parsedRequest['query']['hub.tag'] != null && parsedRequest['query']['hub.tag'].length > 0) {
        var hashtag = parsedRequest['query']['hub.tag'];
        Instagram.subscriptions.subscribe({
            object: 'tag',
            object_id: hashtag
            // aspect: 'media',
            // callback_url: 'http://photogrambrazil.herokuapp.com/callback',
            // type: 'subscription',
            // id: '#'
        });

        io.sockets.once('connection', function (socket) {
            Instagram.tags.recent({
                name: hashtag,
                complete: function(data) {
                    socket.emit(req.params[0] + '/firstShow', { firstShow: data });
                }
            });
        });
    }

    dictTagId[req.params[0]] = hashtag;
    io.sockets.emit(req.params[0] + '/slideshow', { hashtagTitle: hashtag });
    res.redirect(req.get('referer'));
    return res.end();
});

app.get(/^\/(mainapp|secondaryapp|teatrogazeta|iguana)\/unsubscribe/, function(req, res) {
    var parsedRequest = url.parse(req.url, true);

    if (parsedRequest['query']['hub.tag'] != null && parsedRequest['query']['hub.tag'].length > 0) {
        var hashtag = parsedRequest['query']['hub.tag'];
        Instagram.subscriptions.list({
            complete: function(data) {
                for(i in data){
                    if(data[i].object_id == hashtag){
                        Instagram.subscriptions.unsubscribe({object: 'tag', id: data[i].id});
                    }
                }
            }
        });
    }

    delete dictTagId[req.params[0]];

    res.redirect(req.get('referer'));
    return res.end();
});

/**
 * for each new post Instagram send us the data
 */
app.post('/callback', function(req, res) {
    var data = req.body;

    // Grab the hashtag "tag.object_id"
    // concatenate to the url and send as a argument to the client side
    data.forEach(function(tag) {
        var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id=' + clientID;
        sendMessage(url, tag.object_id);
    });
    res.end();
});

app.post(/^\/(mainapp|secondaryapp|teatrogazeta|iguana)\/insert/, function(req, res){
    var data = req.body;
    io.sockets.emit(req.params[0] + '/insert', data);
    res.end();
});

app.post(/^\/(mainapp|secondaryapp|teatrogazeta|iguana)\/remove/, function(req, res){
    var data = req.body;
    io.sockets.emit(req.params[0] + '/remove', data);
    res.end();
});
/**
 * Send the url with the hashtag to the client side
 * to do the ajax call based on the url
 * @param  {[string]} url [the url as string with the hashtag]
 */
function sendMessage(url, objectId) {
    if(objectId == dictTagId['mainapp']){
        io.sockets.emit('mainapp/show', { show: url });
    }
    else if(objectId == dictTagId['secondaryapp']){
        io.sockets.emit('secondaryapp/show', { show: url });
    }
    else if(objectId == dictTagId['teatrogazeta']){
        io.sockets.emit('teatrogazeta/show', { show: url });
    }
    else if(objectId == dictTagId['iguana']){
        io.sockets.emit('iguana/show', { show: url });
    }
}

console.log("Listening on port " + port);

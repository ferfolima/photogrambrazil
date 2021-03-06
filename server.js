var express = require("express");
var app = express();
var port = process.env.PORT || 8081;

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
var clientID = process.env.IG_CLIENT_ID,
    clientSecret = process.env.IG_CLIENT_SECRET,
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
Instagram.set('callback_url', 'http://photogrambrazil.elasticbeanstalk.com/callback');
// Instagram.set('callback_url', 'http://localhost:5000/callback');
Instagram.set('redirect_uri', 'http://photogrambrazil.elasticbeanstalk.com/');
// Instagram.set('redirect_uri', 'http://localhost:5000/');

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

app.get(/^\/(mainapp|teatrogazeta|iguana)\/upload/, function (req, res) {
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

app.get(/^\/(mainapp|teatrogazeta|iguana)\/slideshow/, function(req, res){
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

app.get(/^\/(mainapp|teatrogazeta|iguana)\/subscribe/, function(req, res) {
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

app.get(/^\/(mainapp|teatrogazeta|iguana)\/unsubscribe/, function(req, res) {
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

app.post(/^\/(mainapp|teatrogazeta|iguana)\/insert/, function(req, res){
    var data = req.body;
    io.sockets.emit(req.params[0] + '/insert', data);
   /* var fs = require('fs');
    data['insert'] = data['insert'].replace('https', 'http');
    var file_name = data['insert'].substring(data['insert'].lastIndexOf('/')+1,data['insert'].length);
    var file = fs.createWriteStream(file_name);
    var request = http.get(data['insert'], function(response) {
       response.pipe(file);
       file.on('finish', function() {
         console.log('File printed succesfully');
         file.close();  // close() is async, call cb after close completes.
       });
    })
    .on('error', function(err) { // Handle errors
      console.log('File not printed');
      fs.unlink(file_name); // Delete the file async. (But we don't check the result)
    });*/
    res.end();
});

app.post(/^\/(mainapp|teatrogazeta|iguana)\/remove/, function(req, res){
    var data = req.body;
    io.sockets.emit(req.params[0] + '/remove', data);
    res.end();
});
/**
 * Send the url with the hashtag to the client side
 * to do the ajax call based on the url
 * @param  {[string]} url [the url as string with the hashtag]
 */

 // function print_file(file){
  //  var printer = require('node-printer');
  //  printer.printFile({filename:file,
  //   // printer: process.env[3],
  // 	success:function(jobID){
  // 		console.log("sent to printer with ID: "+jobID);
  // 	},
  // 	error:function(err){
  //     console.log(err);
  //   }
  // });
 // }

function sendMessage(url, objectId) {
    if(objectId == dictTagId['mainapp']){
        io.sockets.emit('mainapp/show', { show: url });
    }
    else if(objectId == dictTagId['teatrogazeta']){
        io.sockets.emit('teatrogazeta/show', { show: url });
    }
    else if(objectId == dictTagId['iguana']){
        io.sockets.emit('iguana/show', { show: url });
    }
}

console.log("Listening on port " + port);

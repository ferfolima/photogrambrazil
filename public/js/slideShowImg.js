(function() {
    var socket = io.connect('http://test-gram.herokuapp.com');

    /**
     * [Namespacing]
     */
    var Insta = Insta || {};
    
    Insta.App = {

        /**
         * [Application initialization method / call for the methods being initializated in order]
         */
        init: function() {
            this.mostRecent();
        },

        /**
         * [ render most recent pics defined by subscribed hashtag ]
         */
        mostRecent: function() {
            socket.on('insert', function (data) {
                var standardResolution = data.insert;
                var count = 0;
                var thumbnail = "";
                standardResolution.split("/").forEach(function (item){
                    count += 1;
                    if(count == 6){
                        thumbnail += "s150x150/" + item + "/";
                    }
                    else if(count == 7){
                        thumbnail += item;
                    }
                    else{
                        thumbnail += item + "/";
                    }
                });

                //slides
                var slideTag = document.getElementById("slider"); 
                var imgTag = slideTag.getElementsByTagName("img");
                var imgTagSrc = [];
                var results = [];
                for (var i = 0; i < imgTag.length; i++) { 
                    imgTagSrc.push(imgTag[i].getAttribute("src")); 
                }
                imgTagSrc.push(standardResolution);
                //document.getElementById("slider").innerHTML = '';
                var
                    query = imgTagSrc,
                    source = $('#slideShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate({insert: query}),
                    imgWrap = $('#slider');
                //imgWrap.append(result);
                results.push(result);
                //thumbnails
                var slideTagThumb = document.getElementById("mcts1"); 
                var imgTagThumb = slideTagThumb.getElementsByTagName("img");
                var imgTagThumbSrc = [];
                for (var i = 0; i < imgTagThumb.length; i++) { 
                    imgTagThumbSrc.push(imgTagThumb[i].getAttribute("src")); 
                }
                imgTagThumbSrc.push(thumbnail);
                //document.getElementById("mcts1").innerHTML = '';
                query = imgTagThumbSrc;
                source = $('#slideShowThumbs').html();
                compiledTemplate = Handlebars.compile(source);
                var result2 = compiledTemplate({insert: query});
                imgWrap = $('#mcts1');
                results.push(result2);
                //imgWrap.append(result);
                populateSlider(results);
            });
        }

    };

    Insta.App.init();

})(this);

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

                var slideTag = document.getElementById("slider"); 
                var imgTag = slideTag.getElementsByTagName("img");
                var imgTagSrc = [];
                document.getElementById("slider").innerHTML;
                for (var i = 0; i < imgTag.length; i++) { 
                    imgTagSrc.push(imgTag[i].getAttribute("src")); 
                }
                imgTagSrc.push(standardResolution);
                document.getElementById("slider").innerHTML = '';
                var
                    query = imgTagSrc,
                    source = $('#slideShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate({insert: query}),
                    imgWrap = $('#slider');
                imgWrap.append(result);
                alert(result);
                
                clean = $('mcts1').find('div').remove();
                query = thumbnail;
                source = $('#slideShowThumbs').html();
                compiledTemplate = Handlebars.compile(source);
                result = compiledTemplate({insert: query});
                imgWrap = $('#mcts1');

                imgWrap.append(result);
                populateSlider();
                alert(result);
            });
        }

    };

    Insta.App.init();

})(this);

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
                //var clean = $('slider').find('img').remove();
                var standarResolution = data.insert;
                var count = 0;
                var thumbnail = "";
                standarResolution.split("/").forEach(function (item){
                    count += 1;
                    if(count == 6){
                        thumbnail += "s150x150/";
                    }
                    else if(count == 7){
                        thumbnail += item;
                    }
                    else{
                        thumbnail += item + "/";
                    }
                });

                //alert(standarResolution);
                //alert(thumbnail);

                var
                    query = standarResolution,
                    source = $('#slideShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate(query),
                    imgWrap = $('#slider');

                imgWrap.append(result);

                //clean = $('mcts1').find('img').remove();

                query = thumbnail;
                source = $('#slideShowThumbs').html();
                compiledTemplate = Handlebars.compile(source);
                result = compiledTemplate(query);
                imgWrap = $('#mcts1');

                imgWrap.append({thumbnails : result});

                /*imgWrap = document.getElementById('mcts1');
                imgArray = imgWrap.getElementsByTagName("img");
                imgWrap.innerHTML = '';
                
                imgWrap = $('#mcts1');
                for (var i = 0; i < imgArray.length; i++) {
                    alert(imgArray[i]);
                    imgWrap.append(imgArray[i]);
                }
                query = data;
                source = $('#slideShowThumbs').html();
                compiledTemplate = Handlebars.compile(source);
                result = compiledTemplate(query);
                imgWrap.append(result);*/

                populateSlider();
            });
        }

    };

    Insta.App.init();

})(this);

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
                var clean = $('slider').find('div').remove();
                alert(clean);
                var standarResolution = data.insert;
                var count = 0;
                var thumbnail = "";
                standarResolution.split("/").forEach(function (item){
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

                var
                    query = standarResolution,
                    source = $('#slideShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate({insert: query}),
                    imgWrap = $('#slider');
                imgWrap.append(result);
                
                clean = $('mcts1').find('div').remove();
                query = thumbnail;
                source = $('#slideShowThumbs').html();
                compiledTemplate = Handlebars.compile(source);
                result = compiledTemplate({insert: query});
                imgWrap = $('#mcts1');

                imgWrap.append(result);
                populateSlider();
            });
        }

    };

    Insta.App.init();

})(this);

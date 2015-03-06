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
                var
                    query = data,
                    source = $('#slideShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate(query),
                    imgWrap = $('#slider');

                imgWrap.append(result);

                //clean = $('mcts1').find('img').remove();
                query = data;
                source = $('#slideShowThumbs').html();
                compiledTemplate = Handlebars.compile(source);
                result = compiledTemplate(query);
                imgWrap = document.getElementById('mcts1');

                imgWrap.innerHTML = result;

                populateSlider();
            });
        }

    };

    Insta.App.init();

})(this);

(function() {
    var socket = io.connect('http://photogrambrazil.herokuapp.com');

    /**
     * [Namespacing]
     */
    var Insta = Insta || {};

    Insta.App = {

        /**
         * [Application initialization method / call for the methods being initializated in order]
         */
        init: function() {
            this.setHashtag();
            this.mostRecent();
        },

        /**
         * [ render most recent pics defined by subscribed hashtag ]
         */

        setHashtag: function(){
            socket.on('teatrogazeta/slideshow', function (data) {
                var clean = $('hashtagTitle').find('p').remove();
                var
                    query = data,
                    source = $('#set-hashtag').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result2 = compiledTemplate({insert2: query}),
                    imgWrap = $('#hashid');

                imgWrap.html(result);
            });
        },

        mostRecent: function() {
            socket.on('teatrogazeta/insert', function (data) {
                var standardResolution = data.insert;
                var results = [];
                var
                    query = standardResolution,
                    source = $('#slideShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate({insert: query}),
                    imgWrap = $('#slider');
                results.push(result);
                populateSlider(results);
            });
        }

    };

    Insta.App.init();

})(this);

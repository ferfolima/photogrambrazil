(function() {
    var socket = io.connect('http://test-gram.herokuapp.com');

    /**
     * [Namespacing]
     */
    var Insta = Insta || {};
    var i;
    Insta.App = {

        /**
         * [Application initialization method / call for the methods being initializated in order]
         */
        init: function() {
            this.mostRecent();
            this.i = 0;
        },

        /**
         * [ render most recent pics defined by subscribed hashtag ]
         */
        mostRecent: function() {
            socket.on('insert', function (data) {
                var clean = $('sliderFrame').find('img').remove();
                var
                    query = data,
                    source = $('#slideShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate(query),
                    imgWrap = $('#sliderFrame');

                imgWrap.append(result);
                this.i = this.i + 1;
                if(this.i == 5){
                    populateSlider();
                    this.i = 0;
                    imgWrap.empty();
                }
            });
        }

    };

    Insta.App.init();

})(this);

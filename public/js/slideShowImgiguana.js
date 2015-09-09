(function() {
    var socket = io.connect('http://photogrambrazil.herokuapp.com');
    var count;
    /**
     * [Namespacing]
     */
    var Insta = Insta || {};

    Insta.App = {

        /**
         * [Application initialization method / call for the methods being initializated in order]
         */
        init: function() {
            count = 0;
            this.mostRecent();
        },

        /**
         * [ render most recent pics defined by subscribed hashtag ]
         */

        mostRecent: function() {
            socket.on('iguana/insert', function (data) {
                var standardResolution = data.insert;
                var results = [];
                var
                    query = standardResolution,
                    source = $('#slideShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate({insert: query});
                if(count % 2 == 0){
                  var imgWrap = $('#slider');
                }
                else {
                  var imgWrap = $('#slider2');
                }
                results.push(result);
                populateSlider(results,count);

                var sPageURL = window.location.search.substring(1);
                var sParameterName = sPageURL.split('=');
                if (sParameterName[0] == 'hub.tag')
                {
                    var elements = document.getElementsByClassName('hashtagTitle');
                    for (var i = 0; i < elements.length; i++) {
                      elements[i].innerHTML = '#' + sParameterName[1];
                    }
                }
                count++;
            });
        }

    };

    Insta.App.init();

})(this);
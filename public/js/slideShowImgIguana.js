(function() {
    var socket = io.connect();
    // var socket = io.connect();
    var count;
    var results;
    /**
     * [Namespacing]
     */
    var Insta = Insta || {};

    Insta.App = {

        /**
         * [Application initialization method / call for the methods being initializated in order]
         */
        init: function() {
            results = [];
            count = 0;
            this.mostRecent();
        },

        /**
         * [ render most recent pics defined by subscribed hashtag ]
         */

        mostRecent: function() {
            socket.on('iguana/insert', function (data) {

                var standardResolution = data.insert;
                var
                    query = standardResolution,
                    source = $('#slideShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate({insert: query});
                results.push(result);
		if(count % 2 == 0){
		    populateSlider(results[count], '.slider-for');
		} else{
		    populateSlider(results[count], '.slider-for2');
		}
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

            socket.on('iguana/remove', function (data) {
                var standardResolution = data.remove;
                var indexToRemove;
                for(var i = 0; i < results.length; i++){
                  if(results[i].indexOf(standardResolution) != -1){
                    indexToRemove = i;
                    results.splice(indexToRemove,1);
                    break;
                  }
                }
                if(indexToRemove % 2 == 0){
                  var sliderToRemove = '.slider-for';
                }
                else {
                  var sliderToRemove = '.slider-for2';
                }

                depopulateSlider(Math.floor(indexToRemove/2)+3,sliderToRemove);
                count--;
            });
        }

    };

    Insta.App.init();

})(this);

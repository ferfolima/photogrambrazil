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
            this.mostRecent();
            this.getData();
            this.assinarInfo();
            this.mobileNav();
            this.startSlideshow();
        },

        /**
         * [ render most recent pics defined by subscribed hashtag ]
         */
        mostRecent: function() {
            socket.on('firstShow', function (data) {
                var clean = $('imgContent').find('a').remove();
                var
                    query = data,
                    source = $('#firstShow-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate(query),
                    imgWrap = $('#imgContent');

                imgWrap.html(result);
            });
        },

        /**
         * [get data ajax and send to render method]
         */
        getData: function() {
            var self = this;
            socket.on('show', function(data) {
                var url = data.show;
                $.ajax({
                    url: url,
                    type: 'POST',
                    crossDomain: true,
                    dataType: 'jsonp'
                }).done(function (data) {
                    self.renderTemplate(data);
                }); 
            });
        },

        /**
         * [Render the images on the page and check for layout resize]
         */
        renderTemplate: function(data) {
            var lastAnimate, lastSrc, nextSrc, last,
                current = data.data[0].images.standard_resolution.url,
                w = $(document).width();
                var clean = $('imgContent').find('a').remove();
                var
                    query = data,
                    source = $('#mostRecent-tpl').html(),
                    compiledTemplate = Handlebars.compile(source),
                    result = compiledTemplate(query),
                    imgWrap = $('#imgContent');

                imgWrap.prepend(result);

                last = $('#imgContent a:first-child');
                lastSrc = $('#imgContent a:first-child').find('img').attr('src');
                nextSrc = $('#imgContent a:nth-child(2)').find('img').attr('src');

                if( lastSrc === nextSrc ) {
                    last.remove();
                }

                last = $('#imgContent').find(':first-child').removeClass('Hvh');

                if( w >= 900 ) {
                    lastAnimate = $('#imgContent').find(':nth-child(2)').addClass('animated fadeInLeft');
                }

                if( w <= 900 ) {
                    lastAnimate = $('#imgContent').find(':nth-child(1)').addClass('animated fadeInDown');
                }

                $(window).resize(function() {
                    var w = $(document).width();
                    if( w >= 900 ) {
                        lastAnimate = $('#imgContent').find(':nth-child(2)').addClass('animated fadeInLeft');
                    }

                    if( w <= 900 ) {
                        lastAnimate = $('#imgContent').find(':nth-child(1)').addClass('animated fadeInDown');
                    }
                });
        },

        /**
         * [assinar view interaction show/hide]
         */
        assinarInfo: function() {
            var assinar = $('.assinarWrap'),
                btClose = $('#js-closeAssinar').find('a'),
                bt = $('#js-btAssinar'),
                user = localStorage.getItem('user');

            if( user ) {
                assinar.removeClass('active');
            } /*else {
                localStorage.setItem('user', 'visited');
            }*/

            btClose.on('click', function(e) {
                e.preventDefault();
                assinar.removeClass('active');
            });

            bt.on('click', function(e) {
                e.preventDefault();
                if( !assinar.hasClass('active') ) {
                    assinar.addClass('active');
                } else {
                    assinar.removeClass('active');
                }
            });

        },

        startSlideshow: function() {
            var bt = $('#js-btSlideshow');
            
            bt.on('click', function(e) {
                e.preventDefault();
                window.open("http://photogrambrazil.herokuapp.com/slideshow");
            });

        },

        /**
         * [Interaction to open mobile navigation]
         */
        mobileNav: function() {
            var btMobNav = $('#js-mobNav'),
                nav = $('.nav');

            btMobNav.on('click', function(e) {
                e.preventDefault();
                if( !nav.hasClass('active') ) {
                    nav.addClass('active');
                } else {
                    nav.removeClass('active');
                }
            });

        }

    };

    Insta.App.init();

})(this);

function OnChangeCheckbox (checkbox) {
    if (checkbox.checked) {
        //alert ("The check box is checked.");
        $.ajax({  
             type: "POST",  
             url: "http://photogrambrazil.herokuapp.com/insert",  
             data: "insert=" + checkbox.value,  
             success: function(response){  
                 $('#info').html("OK! Data Sent with Response:" + response);  
             },  
             error: function(e){  
                 $('#info').html("OH NOES! Data not sent with Error:" + e);
             }  
         });
    }
    else {
        $.ajax({  
             type: "POST",  
             url: "http://photogrambrazil.herokuapp.com/remove",  
             data: "remove=" + checkbox.value,  
             success: function(response){  
                 $('#info').html("OK! Data Sent with Response:" + response);  
             },  
             error: function(e){  
                 $('#info').html("OH NOES! Data not sent with Error:" + e);
             }  
         });
    }
}

$(function(){
    $('form[name="chooseHash"] input[type="submit"]').click(function(event){
           var $form = $('form[name="chooseHash"]');
           if($(this).val()=='Assinar'){
               $form.attr('action','http://photogrambrazil.heroku.com/subscribe/');
               localStorage.setItem('user', 'visited');
               //var win = window.open('http://test-gram.herokuapp.com/slideshow', '_blank');
           }
            else{
                $form.attr('action','http://photogrambrazil.heroku.com/unsubscribe/');
                localStorage.removeItem('user');
            }
    });
    
    $('form[name="myform"]').submit(function(event){
        alert("form action : " + $(this).attr('action'));
        event.preventDefault();
    });
});



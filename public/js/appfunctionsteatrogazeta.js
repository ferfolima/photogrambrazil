function OnChangeCheckbox (checkbox) {
    if (checkbox.checked) {
        $.ajax({
	         type: "POST",
	         url: "http://photogrambrazil.herokuapp.com/teatrogazeta/insert",
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
               $form.attr('action','http://photogrambrazil.heroku.com/teatrogazeta/subscribe/');
               localStorage.setItem('user', 'visited');
              //  var $hashTag = $('form[name="chooseHash"] input[type="text"]').val();
              //  window.open('http://photogrambrazil.heroku.com/teatrogazeta/slideshow/?hub.tag=' + $hashTag);
           }
            else{
                $form.attr('action','http://photogrambrazil.heroku.com/teatrogazeta/unsubscribe/');
                localStorage.removeItem('user');
            }
    });

    $('form[name="myform"]').submit(function(event){
        alert("form action : " + $(this).attr('action'));
        event.preventDefault();
    });
});

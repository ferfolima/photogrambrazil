function OnChangeCheckbox (checkbox) {
    if (checkbox.checked) {
        $.ajax({
	         type: "POST",
	         url: "/teatrogazeta/insert",
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
	         url: "/teatrogazeta/remove",
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
               $form.attr('action','/teatrogazeta/subscribe/');
               localStorage.setItem('user', 'visited');
              //  var $hashTag = $('form[name="chooseHash"] input[type="text"]').val();
              //  window.open('http://photogrambrazil.heroku.com/teatrogazeta/slideshow/?hub.tag=' + $hashTag);
           }
            else{
                $form.attr('action','/teatrogazeta/unsubscribe/');
                localStorage.removeItem('user');
            }
    });

    $('form[name="myform"]').submit(function(event){
        alert("form action : " + $(this).attr('action'));
        event.preventDefault();
    });
});

function OnChangeCheckbox (checkbox) {
    if (checkbox.checked) {
        $.ajax({
	         type: "POST",
           url: "/iguana/insert",
	         data: "insert=" + checkbox.value,
	         success: function(response){
	             $('#info').html("OK! Data Sent with Response:" + response);
              //  upload_file(checkbox.value);
	         },
	         error: function(e){
	             $('#info').html("OH NOES! Data not sent with Error:" + e);
	         }
	     });
    }
    else {
        $.ajax({
	         type: "POST",
           url: "/iguana/remove",
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

function upload_file(file){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/iguana/upload?src=" + file);
  xhr.send();
}

$(function(){
    $('form[name="chooseHash"] input[type="submit"]').click(function(event){
           var $form = $('form[name="chooseHash"]');
           if($(this).val()=='Assinar'){
              $form.attr('action','/iguana/subscribe/');
               localStorage.setItem('user', 'visited');
              //  var $hashTag = $('form[name="chooseHash"] input[type="text"]').val();
              //  window.open('http://photogrambrazil.heroku.com/teatrogazeta/slideshow/?hub.tag=' + $hashTag);
           }
            else{
                $form.attr('action','/iguana/unsubscribe/');
                localStorage.removeItem('user');
            }
    });

    $('form[name="myform"]').submit(function(event){
        alert("form action : " + $(this).attr('action'));
        event.preventDefault();
    });
});

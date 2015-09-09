function OnChangeCheckbox (checkbox) {
    if (checkbox.checked) {
        $.ajax({
	         type: "POST",
	         url: "http://photogrambrazil.herokuapp.com/iguana/insert",
	         data: "insert=" + checkbox.value,
	         success: function(response){
	             $('#info').html("OK! Data Sent with Response:" + response);
               get_signed_request(checkbox.value);
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

function get_signed_request(file){
  // var file_name = file.substring(file.lastIndexOf('/')+1,file.lastIndexOf('.'));
  // var file_name = file.substring(8);
  // var file_type = file.substring(file.lastIndexOf('.')+1);
  var xhr = new XMLHttpRequest();
  //  xhr.open("GET", "/sign_s3?file_name="+file_name+"&file_type="+file_type);
  xhr.open("GET", "/iguana/upload?src=" + file);
  //  xhr.onreadystatechange = function(){
  //      if(xhr.readyState === 4){
  //          if(xhr.status === 200){
  //              var response = JSON.parse(xhr.responseText);
  //              upload_file(file, response.signed_request, response.url);
  //          }
  //          else{
  //              alert("Could not get signed URL.");
  //          }
  //      }
  //  };
   xhr.send();
}

function upload_file(file, signed_request, url){
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signed_request);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.onload = function() {
        if (xhr.status === 200) {
          alert("status code is 200 OK");
        }
    };
    xhr.onerror = function() {
        alert("Could not upload file.");
    };
    xhr.send(file);
}

$(function(){
    $('form[name="chooseHash"] input[type="submit"]').click(function(event){
           var $form = $('form[name="chooseHash"]');
           if($(this).val()=='Assinar'){
               $form.attr('action','http://photogrambrazil.heroku.com/iguana/subscribe/');
               localStorage.setItem('user', 'visited');
              //  var $hashTag = $('form[name="chooseHash"] input[type="text"]').val();
              //  window.open('http://photogrambrazil.heroku.com/teatrogazeta/slideshow/?hub.tag=' + $hashTag);
           }
            else{
                $form.attr('action','http://photogrambrazil.heroku.com/iguana/unsubscribe/');
                localStorage.removeItem('user');
            }
    });

    $('form[name="myform"]').submit(function(event){
        alert("form action : " + $(this).attr('action'));
        event.preventDefault();
    });
});

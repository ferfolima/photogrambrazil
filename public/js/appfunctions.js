function OnChangeCheckbox (checkbox) {
    if (checkbox.checked) {
        $.ajax({
	         type: "POST",
	         url: "/mainapp/insert",
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
	         url: "/mainapp/remove",
	         data: "remove=" + checkbox.value,
	         success: function(response){
	             $('#info').html("OK! Data Sent with Response:" + response);
	         },
	         error: function(e){
	             $('#info').html("OH NOES! Data not sent with Error:" + e);
	         }
	     });
    }
    // var printContents = document.getElementById(checkbox.value).innerHTML;
    // var originalContents = document.body.innerHTML;
    // document.body.innerHTML = printContents;
    // alert(printContents);
    // window.print();
    // document.body.innerHTML = originalContents;
}

$(function(){
    $('form[name="chooseHash"] input[type="submit"]').click(function(event){
           var $form = $('form[name="chooseHash"]');
           if($(this).val()=='Assinar'){
               $form.attr('action','/mainapp/subscribe/');
               localStorage.setItem('user', 'visited');
           }
            else{
                $form.attr('action','/mainapp/unsubscribe/');
                localStorage.removeItem('user');
            }
    });

    $('form[name="myform"]').submit(function(event){
        alert("form action : " + $(this).attr('action'));
        event.preventDefault();
    });
});

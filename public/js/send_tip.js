$(function() {
    
      $("#searchForm input").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            
            $.ajax({
                url: "/getSearchResults",
                type: "POST",
                data: {					
                    userSelectName: $('#userSelectFilter option:selected').html(),    
                    fromDate: $('#fromDate').val(),
                    toDate: $('#toDate').val()                    
                },
                cache: false,
                success: function(data) {
                                    
                     if (data.indexOf('No') > -1) {
                       
                         $('#filterName').text($('#userSelectFilter option:selected').html());
                         $('#filterFromDate').text($('#fromDate').val());
                         $('#filterToDate').text($('#toDate').val());
                         $('#filter').show();
                        $('#searchForm').trigger("reset");
                         $( "#results" ).html( data );
                    } else {                 
                    
                    var array = JSON.parse(data);
                        globalArrayTips = null;
                        globalArrayTips = array.slice();
                        
                       // alert("global: "+globalArrayTips);

                        var table = '<table class="table table-hover table-responsive">';
                            table += '<tr><th class="text-center">Date</th><th class="text-center">Submitter</th><th class="text-center">Contact Name</th><th class="text-center">Contact Title</th><th class="text-center">Institution</th><th class="text-center">Address</th></tr>'; 

                        for (var i = 0; i < array.length; i++) {
                           // alert(array[i]);
                            //Do something
                            //alert(array[i]);
                            var item = JSON.stringify(array[i]);    
                            //alert(item);
                            table += '<tr><td>'+array[i].TIP_DATE.toString().substring(0, 10) +'</td><td>'+array[i].TIP_USER_NAME+'</td><td>'+array[i].TIP_CONTACT_NAME+ '</td><td>'+array[i].TIP_CONTACT_TITLE+ '</td><td>'+array[i].TIP_INSTITUTION+ '</td><td>'+array[i].TIP_ADDRESS+'</td><td><button onclick="getTipDetails('+i+')" class="btn btn-primary" data-toggle="modal" data-target="#tipDetails">View</button></td></tr>'; 
                        }
                    
                                    
                    $('#filterName').text($('#userSelectFilter option:selected').html());
                    $('#filterFromDate').text($('#fromDate').val());
                    $('#filterToDate').text($('#toDate').val());
                    $('#filter').show();
                    
                    
                    $('#results').html(table);

                    //clear all fields
                    $('#searchForm').trigger("reset");}
                },
                error: function() {
                    //clear all fields
                    $('#searchForm').trigger("reset");
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });
    
    

    $("#contactForm input,textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
			var userSelectEmail = $("#userSelect").val();
            var userSelectName = $('#userSelect option:selected').html();            
            var name = $("input#name").val();
			var title = $("input#title").val();
			var institution = $("input#institution").val();
			var address = $("input#address").val();
			var citystatezip = $("input#citystatezip").val();
            var email = $("input#email").val();
            var phone = $("input#phone").val();
            var message = $("textarea#message").val();
            var firstName = name; // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
            $.ajax({
                url: "/",
                type: "POST",
                data: {
					userSelectEmail: userSelectEmail,
                    userSelectName: userSelectName,    
                    name: name,
					title: title,
					institution: institution,
					address: address,
					citystatezip: citystatezip,
                    phone: phone,
                    email: email,
                    message: message
                },
                cache: false,
                success: function(data) {
                    
                    
                     if (data.indexOf('error') > -1) {
                       //$('#searchForm').trigger("reset");
                        alert(data);
                        $( "#success" ).html( data ).css('color','red');
                        return false;
                     }  
                    
                    // Success message
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-success')
                        .append("<strong>Your tip has been submitted. </strong>");
                    $('#success > .alert-success')
                        .append('</div>');

                    //clear all fields
                    $('#contactForm').trigger("reset");
                    
             $.get( "/getTips", function( data ) {                
               
                if (data.indexOf('No') > -1) {
                    
                    $( "#testDiv" ).html( data );
                } else {
                
                    var array = JSON.parse(data);

                    var content = '<ul class="text-left">';

                    for (var i = 0; i < array.length; i++) {
                       // alert(array[i]);
                        //Do something
                        content += '<li>'+'<strong>Name:</strong> '+array[i].TIP_CONTACT_NAME+ ' | <strong>Title:</strong> ' + array[i].TIP_CONTACT_TITLE + ' | <strong>Institution:</strong> ' + array[i].TIP_INSTITUTION +'</li>'
                        //$( "#testDiv" ).append('<p>'+array[i].TIP_ID+ ' | ' + array[i].TIP_CONTACT_NAME + '</p>'); 
                    }
                    content += '</ul>';

                  $( "#testDiv" ).html( content );   
                }
            });
                },
                error: function() {
                    // Fail message
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-danger').append("<strong>Sorry " + firstName + ", it seems that my mail server is not responding. Please try again later!");
                    $('#success > .alert-danger').append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });

    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});


/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $('#success').html('');
});

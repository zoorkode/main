var api = 'KoboStore';
var games = "freefire"
 function cekNick() {
    var id = $('#id').val();
    if (id === "") {
     $('#nick').text('');
     $('#nickplayer').text('');

    }
   
    $.ajax({
     method: "GET",
     url: "https://payday.my.id/trueid/game/" + games + "?id=" + id + "&key=" + api,
         beforeSend: function () {
     $('#nick').html('<i class="fas fa-spinner"></i> Sedang Mengecek...');
     $('#theend').show()
    },
    success: function (response) {
     if (response.hasOwnProperty('error_msg')) {
      $('#nick').text('Tidak Ditemukan');
      $('#theend').hide()
     } else {
      $('#nick').text(response.nickname);
      $('#theend').show()
     }
    }
   });
}

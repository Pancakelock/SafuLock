jQuery(document).ready(function ($) {
  if (localStorage.getItem('screenModeNightTokenState') == 'night') {
    $('body').addClass('night1');
  }

  $('.day').click(function () {
    localStorage.setItem('screenModeNightTokenState', 'day');
    $('body').removeClass('night1');
    $('.switcher p.active').removeClass('active');
    $(this).addClass('active');
  });

  $('.night').click(function () {
    localStorage.setItem('screenModeNightTokenState', 'night');
    $('body').addClass('night1');
    $('.switcher p.active').removeClass('active');
    $(this).addClass('active');
  });
});

/*table filter*/
$(document).ready(function () {
  $('#myInput').on('keyup', function () {
    var value = $(this).val().toLowerCase();
    $('#myTable tr').filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});

$(function () {
  $('.countrypicker').countrypicker();
});

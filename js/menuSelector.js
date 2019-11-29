$(document).ready(function(){
  $("#supportedBrowsers").popup();

  function sleep(ms) {
    return new Promise(function(resolve){return setTimeout(resolve, ms)});
  }

  async function doRoulette(funcs, curr, len, speed, endtime){
    if(speed >= endtime){
      funcs.onDone();
      return;
    }
      await sleep(speed);
      funcs.onRun((curr + len -1) % len, curr % len);
      doRoulette(funcs, curr+1, len, speed + (speed / 20.), endtime);
  }

  function init(){
    var pages = $(".step.page");
    pages.removeClass('transition visible');
    pages.attr('style', '');
  }

  function reset(){
    init();
    $("#buttonStart").removeClass('disabled loading');
  }

  var randomSpeedMin = 100, randomSpeedMax = 500;

  $('#rangeSpeed').range({
    min: randomSpeedMin,
    max: randomSpeedMax,
    start: (randomSpeedMax + randomSpeedMin) / 2,
    step: 5,
    input: '#inputRangeSpeed'
  });

  var runRoulettePage = function (menuId, menuset){
    var menuset = menuset || {};
    var div = $("#page" + menuId);
    if( !div || Object.keys(menuset).length < 1 ){
      $("#buttonStart").removeClass('disabled loading');
      div.removeClass('running');
      return false;
    }
        
    var menuStr = 'menu' + menuId;
    div.html('');
    Object.keys(menuset).forEach(function(m, idx){
      var item = '<div class="ui label menu-item ' + menuStr + '" id="'+ menuStr +'-'+ idx +'">'+ m +'</div>';
      div.append(item);
    })

    return {
      animation : 'slide down',
      onStart: function(){
        if( div.hasClass('running') ) return;
        div.addClass('running');
      },
      onComplete: function(){
        if( !div.hasClass('running') ) return;

        var speed = Math.max(10, randomSpeedMax - $("#inputRangeSpeed").val());
        var endtime = Math.random() * speed + 20;
        var incTime = Math.min(20, Math.max(50, Math.random()));
        doRoulette({
          onRun: function(prev, curr){
            $('#' + menuStr + '-' + prev).removeClass('huge selected blue');
            $('#' + menuStr + '-' + curr).addClass('huge selected blue');
          },
          onDone: function(){
            var selected = $('.' + menuStr +'.selected');
            selected.addClass('basic');
            var nextId = menuId + 1;
            $("#page" + nextId).transition(
              runRoulettePage(nextId, menuset[selected.html()])
            );
          }
        },
          0, Object.keys(menuset).length, incTime, endtime
        );
      }
    };
  };

  function startRoullette(menus){
    $("#page1").transition(runRoulettePage(1, menus));
  }

  $("#buttonStart").on('click', function(evt){
    var e = evt || window.event;
    //IE9 & Other Browsers
    if (e.stopPropagation) { e.stopPropagation(); }
    //IE8 and Lower
    else { e.cancelBubble = true; }
    e.preventDefault();

    init();
    $("#buttonStart").addClass('disabled loading');
    $.getJSON('https://raw.githubusercontent.com/joonas-yoon/MenuSelectHelper/master/js/menus.json', startRoullette);
  });
});
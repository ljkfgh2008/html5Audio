(function($){
		var repeat = localStorage.repeat || 0,
		shuffle = localStorage.shuffle || 'false',
		continous = true,
		autoplay = false,
		playlist = [{
			    title: 'Drunk In Love',
			    artist: 'Beyonce,Jay-Z',
			    album: 'Drunk In Love',
			    cover: 'file/cover/Drunk In Love.jpg',
			    mp3: 'file/Drunk In Love.mp3',
			    ogg: 'file/Drunk In Love.ogg'
			  },{
			    title: 'Maps',
			    artist: 'Maroon5',
			    album: 'Maps',
			    cover: 'file/cover/Maps-Maroon5.jpg',
			    mp3: 'file/Maps.mp3',
			    ogg: 'file/Maps.ogg'
			  }];

		//播放列表
		for (var i=0; i<playlist.length; i++){
			var item = playlist[i];
			$('#playlist').append('<li class="list-info">'
							+'<a class="song-name">'
							+'	<span class="song-name-text">'+item.artist+' - '+item.title+'</span>'
							+'</a>'
							+'<span class="icon-playing"></span>'
						+'</li>');
		}

			/*定义赋值所需变量*/	
	var time = new Date(),//获取时间用于播放时间
		currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,//检测是否随机播放
		trigger = false,//
		audio, timeout, isPlaying, playCounts;

	var play = function(){
		audio.play();
		$('.playback').addClass('playing');
		timeout = setInterval(updateProgress, 500);
		isPlaying = true;
	};

	var pause = function(){
		audio.pause();
		$('.playback').removeClass('playing');
		clearInterval(updateProgress);
		isPlaying = false;
	};

    var shufflePlay = function(){
        var time = new Date(),
            lastTrack = currentTrack;
        currentTrack = time.getTime() % playlist.length;
        if (lastTrack == currentTrack) ++currentTrack;
        switchTrack(currentTrack);
    };

	var setProgress = function(value) {
		var currentSec = parseInt(value%60) < 10 ? '0' + parseInt(value%60) : parseInt(value%60),
			ratio = value / audio.duration * 100;
			$('.timer').html(parseInt(value/60)+':'+currentSec);
			$('.progress .pace').css('width', ratio + '%');
			$('.progress .slider a').css('left', ratio + '%');
	};

	var updateProgress = function(){
		setProgress(audio.currentTime);
	};


	var setVolume = function(value){
		audio.volume = localStorage.volume = value;
		$('.volume .pace').css('width',value * 100 + '%');
		$('.volume .slider a').css('left', value * 100 + '%');
	};


	$('.progress .slider').slider({step: 0.1, slide: function(event, ui){
		$(this).addClass('enable');
		setProgress(audio.duration * ui.value / 100);
		clearInterval(timeout);
	}, stop: function(event, ui){
		audio.currentTime = audio.duration * ui.value / 100;
		$(this).removeClass('enable');
		timeout = setInterval(updateProgress, 500);
	}});


	var volume = localStorage.volume || 0.5;
	$('.volume .slider').slider({max: 1,min: 0,step: 0.1, value: volume,slide:function(event, ui) {
		setVolume(ui.value);
		$(this).addClass('enable');
		$('.mute').removeClass('enable');
	},stop:function(){
		$(this).removeClass('enable');
	}}).children('.pace').css('width', volume * 100 + '%');

	$('.mute').click(function(){
		if($(this).hasClass('enable')){
			console.log("a");
			setVolume($(this).data('volume'));
			$(this).removeClass('enable');
		}else{
			$(this).data('volume', audio.volume).addClass('enable');
			setVolume(0);
		}
	});

	var switchTrack = function(i){
		if (i < 0){
			track = currentTrack = playlist.length - 1;
		} else if (i >= playlist.length){
			track = currentTrack = 0;
		} else {
			track = i;
		}

		$('audio').remove();
		loadMusicfile(track);
		if (isPlaying == true) play();
	};

    var ended = function(){
        pause();
        audio.currentTime = 0;
        if (continous == true) isPlaying = true;
        if (repeat == 1){
            play();
        }else{
            if (shuffle === 'true'){
                shufflePlay();
            } else {
                if (repeat == 2){
                    switchTrack(++currentTrack);
                } else {
                    console.log(currentTrack);
                    if (currentTrack < playlist.length) switchTrack(++currentTrack);
                }
            }
        }
    };


	var beforeLoad = function(){
		var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
		$('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) +'%');
	}

	// Fire when track loaded completely
	var afterLoad = function(){
		if (autoplay == true) play();
	}


	var loadMusicfile = function(i){
		var item = playlist[i],
			newaudio = $('<audio>').html('<source src="'+item.mp3+'"><source src="'+item.ogg+'">').appendTo('#playMode');
		
		$('.cover').html('<img src="'+item.cover+'" alt="'+item.album+'">');
		$('.tag').html('<strong>'+item.title+'</strong><span class="artist">'+item.artist+'</span><span class="album">'+item.album+'</span>');
		$('#playlist li').removeClass('playing').eq(i).addClass('playing');
		audio = newaudio[0];
		audio.volume = $('.mute').hasClass('enable') ? 0 : volume;
		audio.addEventListener('progress', beforeLoad, false);
		audio.addEventListener('durationchange', beforeLoad, false);
		audio.addEventListener('canplay', afterLoad, false);
        audio.addEventListener('ended', ended, false);
	};

    loadMusicfile(currentTrack);
	$('.playback').on('click', function(){
		if ($(this).hasClass('playing')){
			pause();
		} else {
			play();
		}
	});

	$('#playlist li').each(function(i){		
		var _i = i;
		$(this).on('click', function(){
			switchTrack(_i);
		});
	});

	$('.fastforward').on('click', function(){
		if (shuffle === 'true'){
			shufflePlay();
		} else {
			switchTrack(++currentTrack);
		}
	});

	$('.rewind').on('click', function(){
		if (shuffle === 'true'){
			shufflePlay();
		} else {
			switchTrack(--currentTrack);
		}
	});
})(jQuery);
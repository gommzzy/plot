//sidebar_channel.js
$(document).ready(function(){
    var pathVar;
    var fileName;
    var plotTypeVar = 1;
    var peakTypeVar = 1;

    $.getJSON('/directory_structure', function(data) {
        renderDirectoryTree(data, $('#directoryTree'));
    });

    function renderDirectoryTree(data, element, depth=0) {
        element.empty();
        $.each(data, function(index, item) {
            var li = $('<li>').appendTo(element);
            var itemText = $('<span>').text(item.name).appendTo(li);
            if (item.type === 'directory') {
                var toggle = $('<span class="toggle">∨</span>').prependTo(li);
                var ul = $('<ul>').appendTo(li).hide();
                toggle.css('margin-left', (depth * 20) + 'px'); // 들여쓰기 설정
                itemText.css('margin-left', '5px'); // 폴더명과 토글 사이 간격 조정
                itemText.click(function() {
                    ul.toggle();
                    toggle.text(ul.is(':visible') ? '∧' : '∨');
                });
                toggle.click(function() {
                    ul.toggle();
                    toggle.text(ul.is(':visible') ? '∧' : '∨');
                });
                renderDirectoryTree(item.children, ul, depth + 1); // 하위 폴더 재귀 호출
            } else {
                itemText.css('margin-left', (depth * 20 + 25) + 'px'); // 파일명 들여쓰기 설정

                if (item.name.endsWith('.tdms')){
                    var toggle = $('<span class="toggle">∨</span>').prependTo(li);
                    var channelUl = $('<ul class="channel-names">').appendTo(li).hide();
                    itemText.css('margin-left', '5px'); // 파일명과 토글 사이 간격 조정

                    itemText.click(function(){
                        if (channelUl.is(':empty')) { // 이미 채널명이 있는 경우 중복 요청 방지
                            path = item.path;
                            fileName = item.name;
                            $.getJSON('/sidebar/channel', { path: item.path }, function(data) {
                                channelUl.empty();
                                $.each(data, function(i, channel) {
                                    var channelLi = $('<li>').text(channel).appendTo(channelUl).
                                    css('margin-left', (depth + 1) * 20 + 'px');
                                    channelLi.click(function(){
                                        pathVar = item.path;
                                        chNameVar = channel;
                                        console.log(pathVar, chNameVar)
                                            $.getJSON('/draw/' + pageType, {path:item.path, chName:channel, plotType:plotTypeVar,
                                            peakType:peakTypeVar}, function(data) {
                                                $('.graph_area').empty();
                                                $('.graph_area').append($('<div class="contentTitle">').text(item.name));
                                                $.each(data, function(index, plot) {
                                                    $('.graph_area').append($('<div>').html(plot));
                                            });
                                        });
                                    });
                                });
                                channelUl.show(); // 채널명이 로드되면 보여줌
                            });
                        } else {
                            channelUl.toggle(); // 이미 채널명이 있는 경우 토글만 수행
                        }
                        toggle.text(channelUl.is(':visible') ? '∧' : '∨');
                    });

                    toggle.css('margin-left', (depth * 20) + 'px');
                    toggle.click(function() {
                        channelUl.toggle();
                        toggle.text(channelUl.is(':visible') ? '∧' : '∨');
                    });
                }
            }
        });
    }

    // Handle plot_type radio button change
    $('input[name="plot_type"]').change(function() {
        if ($(this).is(':checked')) {
            plotTypeVar = $(this).val();
            $.getJSON('/draw/trend', {path:pathVar, chName:chNameVar, plotType:$(this).val()}, function(data) {
                $('.graph_area').empty();
                $('.graph_area').append($('<div class="contentTitle">').text(chNameVar));
                $.each(data, function(index, plot) {
                    $('.graph_area').append($('<div>').html(plot));
                });
            });
        }
    });

    // Handle peak_type radio button change
    $('input[name="peck_type"]').change(function() {
        if ($(this).is(':checked')) {
            peakTypeVar =  $(this).val();
            $.getJSON('/draw/' + pageType, {path:pathVar, chName:chNameVar, plotType:plotTypeVar, peakType:$(this).val()}, function(data) {
                $('.graph_area').empty();
                $('.graph_area').append($('<div class="contentTitle">').text(chNameVar));
                $.each(data, function(index, plot) {
                    $('.graph_area').append($('<div>').html(plot));
                });
            });
        }
    });

});

//sidbar_tdms.js
$(document).ready(function(){
    var path;
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
                    itemText.click(function(){
                        path = item.path;
                        fileName = item.name;
                        $.getJSON('/draw/' + pageType, {path: path,  plotType: plotTypeVar, peakType:peakTypeVar}, function(data) {
                            $('.graph_area').empty();
                            $('.graph_area').append($('<div class="contentTitle">').text(item.name));
                            $.each(data, function(index, plot) {
                                $('.graph_area').append($('<div>').html(plot));
                            });
                        });
                            if (pageType === 'single') {
                                $('.point_label_tool').css('display', 'flex');
                            }

                    });
                }
            }
        });
    }

        // Handle plot_type radio button change
    $('input[name="plot_type"]').change(function() {
        if ($(this).is(':checked')) {
            plotTypeVar = $(this).val();
            $.getJSON('/draw/'+ pageType, {path:path, plotType: $(this).val()}, function(data) {
                $('.graph_area').empty();
                $('.graph_area').append($('<div class="contentTitle">').text(fileName));
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
            $.getJSON('/draw/' + pageType, {path: path, plotType: plotTypeVar, peakType:$(this).val()}, function(data) {
                $('.graph_area').empty();
                $('.graph_area').append($('<div class="contentTitle">').text(fileName));
                $.each(data, function(index, plot) {
                    $('.graph_area').append($('<div>').html(plot));
                });
            });
        }
    });

});

//single.js
var graph;
$(document).ready(function(){
    $('input[id="tool1"]').change(function() {
        if ($(this).is(':checked')) {
            console.log('Tool1 toggled!');
            graph = document.getElementsByClassName('plotly-graph-div')[0];
            graph.on('plotly_click', function(data){
                createAnnotation(data)
                var point = data.points[0];
                console.log('클릭된 포인트의 x값:', point.x);
                console.log('클릭된 포인트의 y값:', point.y);
            });
        }
    });
});
function createAnnotation(data) {
//    if (!annotationOn) return;

    var x = data.points[0].x;
    var y = data.points[0].y;
//    var format_y = (y * 1e9).toFixed(2) + 'n';
//    var pointInfo = ` x : (${x.toFixed(0)}), y : (${format_y}) `;

//    console.log(format_y,pointInfo)
    var update = {
        annotations: [{
            x: x, y: y, xref: 'x', yref: 'y',
            text: ` x : (${x}), y : (${y}) `,
            showarrow: true,
            arrowhead: 1, ax: 0, ay: -40,
            font: {
                family: 'Arial, sans-serif',
                size: 14,
                color: '#007bff'
            },
            align: 'center', arrowcolor: '#007bff',
            bgcolor: 'white',
            bordercolor: '#007bff',
            borderwidth: 2,
            borderpad: 2,
//            visible: annotationOn  // Set initial visibility based on annotationOn
        }],
        shapes: [{
            type: 'line', x0: x, x1: x, y0: 0,
            y1: 1, xref: 'x', yref: 'paper',
            line: {
                color: 'gray',
                width: 1,
                dash: 'dash'
            }
        }]
    };

    Plotly.relayout(graph, update);
}




//document.addEventListener('DOMContentLoaded', function() {
//    var plot;
//    var annotationToggle = document.getElementById('toggleAnnotation');
//    var annotationOn = true;
//    var inputNumber = document.getElementById('inputNumber');
//
//    // MutationObserver를 사용하여 동적으로 생성된 plot 요소를 감지
//    var observer = new MutationObserver(function(mutations) {
//        mutations.forEach(function(mutation) {
//            if (mutation.addedNodes.length > 0) {
//                mutation.addedNodes.forEach(function(node) {
//                    if (node.classList && node.classList.contains('plotly')) {
//                        plot = node;
//                        console.log('plot element found: ', plot);
//                        observer.disconnect(); // plot 요소를 찾았으므로 더 이상 감시할 필요 없음
//                    }
//                });
//            }
//        });
//    });
//
//    // .plot-container 요소를 감시
//    var plotContainer = document.querySelector('.plot-container');
//    if (plotContainer) {
//        observer.observe(plotContainer, { childList: true, subtree: true });
//    } else {
//        console.error('plot-container element not found');
//    }
//
//    annotationToggle.addEventListener('click', function() {
//        console.log('click listener start');
//        if (plot) {
//            console.log('plot : ', plot);
//            findYValueForX(10); // 예시로 X값 10을 사용하여 함수 호출
//        } else {
//            console.log('plot element not found');
//        }
//    });
//
//    function findYValueForX(xValue) {
//        if (!plot) {
//            console.error('plot element is not available');
//            return;
//        }
//
//        var xData = plot.data[0].x; // Assuming the x data is in the first trace
//        var yData = plot.data[0].y; // Assuming the y data is in the first trace
//
//        // xValue에 해당하는 yValue를 찾는 로직을 여기에 추가
//        console.log('xData:', xData);
//        console.log('yData:', yData);
//    }
//});



//
//document.addEventListener('DOMContentLoaded', function() {
//    var plot;
//    var annotationToggle = document.getElementById('toggleAnnotation');
//    var annotationOn = true;
//    var inputNumber = document.getElementById('inputNumber');
//
//    annotationToggle.addEventListener('click', function() {
//        console.log('click listener start')
//        plot = document.querySelector('.plot-container .plotly');
//        console.log('plot : ',plot)
//    });
//
//
//    function findYValueForX(xValue) {
//        var xData = plot.data[0].x; // Assuming the x data is in the first trace
//        var yData = plot.data[0].y; // Assuming the y data is in the first trace
//
//        // Find the index of the closest x value in the data array
//        var closestIndex = xData.reduce(function(prev, curr, currentIndex) {
//            return (Math.abs(curr - xValue) < Math.abs(xData[prev] - xValue) ? currentIndex : prev);
//        }, 0);
//
//        var closestX = xData[closestIndex];
//        var closestY = yData[closestIndex];
//
//        // Call createAnnotation function with the found x and y values
//        createAnnotation({ points: [{ x: closestX, y: closestY }] });
//    }
//
//    function createAnnotation(data) {
//        if (!annotationOn) return;
//
//        var x = data.points[0].x;
//        var y = data.points[0].y;
//        var format_y = (y * 1e9).toFixed(2) + 'n';
//        var pointInfo = ` x : (${x.toFixed(0)}), y : (${format_y}) `;
//
//        var update = {
//            annotations: [{
//                x: x, y: y, xref: 'x', yref: 'y',
//                text: pointInfo,
//                showarrow: true,
//                arrowhead: 1, ax: 0, ay: -40,
//                font: {
//                    family: 'Arial, sans-serif',
//                    size: 14,
//                    color: '#007bff'
//                },
//                align: 'center', arrowcolor: '#007bff',
//                bgcolor: 'white',
//                bordercolor: '#007bff',
//                borderwidth: 2,
//                borderpad: 2,
//                visible: annotationOn  // Set initial visibility based on annotationOn
//            }],
//            shapes: [{
//                type: 'line', x0: x, x1: x, y0: 0,
//                y1: 1, xref: 'x', yref: 'paper',
//                line: {
//                    color: 'gray',
//                    width: 1,
//                    dash: 'dash'
//                }
//            }]
//        };
//
//        Plotly.relayout(plot, update);
//    }
//
//    plot.on('plotly_click', function(data) {
//        if (!annotationOn) return;
//        createAnnotation(data);
//    });
//
//    // Event listener for input field change
//    inputNumber.addEventListener('input', function(event) {
//        var enteredX = parseFloat(event.target.value);
//        findYValueForX(enteredX);
//    });
//});

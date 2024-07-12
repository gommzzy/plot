var graph;
var form2Value;

$(document).ready(function(){

    $('input[id="tool1"]').change(function() {
        if ($(this).is(':checked')) {
            $('#inputFreq').css('display', 'none');
            graph = document.getElementsByClassName('plotly-graph-div')[0];
            graph.on('plotly_click', function(data){
                createAnnotation(data)
            });
        }else {
            graph.removeAllListeners('plotly_click');
        }
    });

    $('input[id="tool2"]').change(function() {
        if ($(this).is(':checked')) {
            graph.removeAllListeners('plotly_click');
            removeAnnotation();
            $('#inputFreq').css('display', 'flex');
            createHarmonics(1000);
        }
    });

    $('input[id="tool3"]').change(function() {
        if ($(this).is(':checked')) {
            graph.removeAllListeners('plotly_click');
            removeAnnotation();
            $('#inputFreq').css('display', 'flex');
            graph.on('plotly_click', function(data){
                createSideband(data,1000)
            });
        }
    });

    $('#inputNumber').on('input', function(event) {
        var enteredX = parseFloat($(event.target).val());
        findYValueForX(enteredX);
    });

    $('#inputFreq').on('input', function(event) {
        form2Value = parseFloat($(event.target).val());
        createHarmonics(form2Value);
        createSideband(form2Value);
    });


});

function createAnnotation(data) {
    var x = data.points[0].x;
    var y = data.points[0].y;
    var format_y = (y * 1e9).toFixed(2) + 'n';
    var pointInfo = ` x : (${x.toFixed(0)}), y : (${format_y}) `;

    var update = {
        annotations: [{
            x: x, y: y, xref: 'x', yref: 'y',
            text: pointInfo,
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

function removeAnnotation() {
    var update = {
        annotations: [],
        shapes: []
    };
    Plotly.relayout(graph, update);
}

function findYValueForX(xValue) {
    var xData = graph.data[0].x;
    var yData = graph.data[0].y;

    var closestIndex = xData.reduce(function(prev, curr, currentIndex) {
        return (Math.abs(curr - xValue) < Math.abs(xData[prev] - xValue) ? currentIndex : prev);
    }, 0);

    var closestX = xData[closestIndex];
    var closestY = yData[closestIndex];

    createAnnotation({ points: [{ x: closestX, y: closestY }] });
}

function createHarmonics(formValue) {
    var shapes = [];
    var xValues = graph.data[0].x;
    var holdLabels = []; // Array to hold x-axis labels

    for (var i = 0; i < xValues.length; i++) {
        if (xValues[i] % formValue === 0 && xValues[i] !== 0) {
            shapes.push({
                type: 'line',
                x0: xValues[i],
                y0: 0,
                y1: 1,
                yref: 'paper',
                x1: xValues[i],
                line: {
                    color: 'gray',
                    width: 1,
                    dash: 'dash'
                }
            });

            // Adding x-axis label annotation
            holdLabels.push({
                x: xValues[i],
                y0: 0, y1:1,
                text:` x : ${xValues[i].toString()} ` ,
                showarrow: false,
                font: {
                    family: 'Arial, sans-serif',
                    size: 12,
                    color: '#007bff'
                },
                align: 'center',
                arrowcolor: '#007bff',
                arrowsize: 1,
                arrowwidth: 2,
                bgcolor: 'white',
                bordercolor: '#007bff',
                borderwidth: 2,
                borderpad: 4,
                borderRadius: '5px'
            });
        }
    }

    var update = {
        annotations: holdLabels, // Update with x-axis labels
        shapes: shapes
    };

    Plotly.relayout(graph, update);
}


function createSideband(data,formValue){
    var holdLabels = [];
    var shapes = [];
    var point = data.points[0];
    var x = point.x;
    var y = point.y;
    var index = point.pointIndex;

    for (var i = 0; i < graph.data[0].x.length; i++) {
        if (Math.abs(i - index) == formValue) {
            holdLabels.push({
                x: graph.data[0].x[i],
                y: graph.data[0].y[i],
                text: `(${graph.data[0].x[i]}, ${(graph.data[0].y[i] * 1e9).toFixed(2) + 'n'})`,
                showarrow: true,
                arrowhead: 7,
                ax: 0,
                ay: -40,
                font: {
                    family: 'Arial, sans-serif',
                    size: 14,
                    color: '#007bff'
                },
                align: 'center',
                arrowcolor: '#007bff',
                arrowsize: 1,
                arrowwidth: 2,
                bgcolor: 'white',
                bordercolor: '#007bff',
                borderwidth: 2,
                borderpad: 4,
                borderRadius: '5px'
            });
            shapes.push({
                type: 'line',
                x0: graph.data[0].x[i],
                x1: graph.data[0].x[i],
                y0: 0, y1: 1, yref: 'paper',
                line: {
                    color: 'gray',
                    width: 1,
                    dash: 'dashdot'
                }
            });
        }
    }

    var update = {
        annotations: holdLabels,
        shapes: shapes
    };
    Plotly.relayout(graph, update);
}
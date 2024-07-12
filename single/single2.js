//single.js

document.addEventListener('DOMContentLoaded', function() {
     var plot = document.querySelector('.plotly_graph .js-plotly-plot'); 
    var annotationToggle = document.getElementById('tool1');
    var annotationOn = true;
    var inputNumber = document.getElementById('inputNumber');

    annotationToggle.addEventListener('click', function() {
        annotationOn = !annotationOn;
        annotationToggle.textContent = annotationOn ? 'Annotation Off' : 'Annotation On';

        var annotations = plot.layout.annotations || [];
        for (var i = 0; i < annotations.length; i++) {
            annotations[i].visible = annotationOn;
        }
        Plotly.relayout(plot, { annotations: annotations });
    });

    function findYValueForX(xValue) {
        var xData = plot.data[0].x; // Assuming the x data is in the first trace
        var yData = plot.data[0].y; // Assuming the y data is in the first trace

        // Find the index of the closest x value in the data array
        var closestIndex = xData.reduce(function(prev, curr, currentIndex) {
            return (Math.abs(curr - xValue) < Math.abs(xData[prev] - xValue) ? currentIndex : prev);
        }, 0);

        var closestX = xData[closestIndex];
        var closestY = yData[closestIndex];

        // Call createAnnotation function with the found x and y values
        createAnnotation({ points: [{ x: closestX, y: closestY }] });
    }

    function createAnnotation(data) {
        if (!annotationOn) return;

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
                visible: annotationOn  // Set initial visibility based on annotationOn
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

        Plotly.relayout(plot, update);
    }

    plot.on('plotly_click', function(data) {
        if (!annotationOn) return;
        createAnnotation(data);
    });

    // Event listener for input field change
    inputNumber.addEventListener('input', function(event) {
        var enteredX = parseFloat(event.target.value);
        findYValueForX(enteredX);
    });
});

// script.js

// Function to handle plotly_click event
function handlePlotlyClick(plot, data) {
    var point = data.points[0];
    var x = point.x;
    var y = point.y;

    var annotations = plot.layout.annotations || [];

    annotations.push({
        x: x,
        y: y,
        xref: 'x',
        yref: 'y',
        text: '(' + x + ', ' + y + ')',
        showarrow: true,
        arrowhead: 7,
        ax: 0,
        ay: -40
    });

    Plotly.relayout(plot, {annotations: annotations});
}

// Function to toggle annotations
function toggleAnnotations(plot) {
    var annotations = plot.layout.annotations || [];
    var button = document.getElementById('toggleAnnotation');

    if (button.innerHTML === 'Annotation Off'){
        button.innerHTML = 'Annotation On';
        Plotly.relayout(plot, {annotations: []});
    } else {
        button.innerHTML = 'Annotation Off';
        Plotly.relayout(plot, {annotations: annotations});
    }
}

// Function to add custom annotation
function addCustomAnnotation(plot, newX) {
    var annotations = plot.layout.annotations || [];
    var foundAnnotation = annotations.find(function(ann){
        return ann.x === newX;
    });

    if (!foundAnnotation){
        annotations.push({
            x: newX,
            y: 0,  // Replace with appropriate y value
            xref: 'x',
            yref: 'y',
            text: 'Custom Annotation',
            showarrow: true,
            arrowhead: 7,
            ax: 0,
            ay: -40
        });

        Plotly.relayout(plot, {annotations: annotations});
    }
}


document.addEventListener('DOMContentLoaded', function() {
    var plot = document.getElementsByClassName('plotly-graph-div')[0];

    plot.on('plotly_click', function(data){
        handlePlotlyClick(plot, data);
    });

    document.getElementById('toggleAnnotation').addEventListener('click', function(){
        toggleAnnotations(plot);
    });

    document.getElementById('inputNumber').addEventListener('change', function(){
        var newX = Number(this.value);
        addCustomAnnotation(plot, newX);
    });
});
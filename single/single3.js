
var graphDiv = document.getElementsByClassName('plotly-graph-div')[0];
var annotationEnabled = false;
var annotation;

graphDiv.on('plotly_click', function(data){
    if (annotationEnabled) {
        addAnnotation(data.points[0].x, data.points[0].y);
    }
});


function addAnnotation(x,y){
    var pointInfo = Seleted Point : (${x}, ${y});

    var annotations = graphDiv.getElementsByClassName('annotation');
    for (var i = 0; i < annotations.length; i++) {
        annotations[i].parentNode.removeChild(annotations[i]);
    }

    annotation = {
        x: x, y: y,
        xref: 'x', yref: 'y',
        text: pointInfo, showarrow: true,
        arrowhead: 7, ax: 0, ay: -40,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: '#007bff', borderwidth: 1,
        opacity: 0.9,
        font: {
            family: 'Arial, sans-serif',
            size: 14,
            color: '#007bff'
        },
        align: 'center',
        xanchor: 'center', yanchor: 'bottom',
        width: 200, height: 40, valign: 'middle'
    };

    Plotly.relayout(graphDiv, {annotations: [annotation]});

}


document.getElementById('toggleAnnotation').addEventListener('click', function(){
    var annotations = graphDiv.layout.annotations || [];
    var button = document.getElementById('toggleAnnotation');

    if (button.innerHTML === 'Annotation Off'){
        button.innerHTML = 'Annotation On';
        Plotly.relayout(graphDiv, {annotations: []});
    } else {
        button.innerHTML = 'Annotation Off';
        Plotly.relayout(graphDiv, {annotations: annotations});
    }
});

document.getElementById('inputNumber').addEventListener('change', function(){
    var newX = Number(this.value);
    var annotations = graphDiv.layout.annotations || [];
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

        Plotly.relayout(graphDiv, {annotations: annotations});
    }
});

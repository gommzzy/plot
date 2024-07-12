
<script>
    var plot = document.getElementsByClassName('plotly-graph-div')[0];

    plot.on('plotly_click', function(data){
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
    });

    document.getElementById('toggleAnnotation').addEventListener('click', function(){
        var annotations = plot.layout.annotations || [];
        var button = document.getElementById('toggleAnnotation');

        if (button.innerHTML === 'Annotation Off'){
            button.innerHTML = 'Annotation On';
            Plotly.relayout(plot, {annotations: []});
        } else {
            button.innerHTML = 'Annotation Off';
            Plotly.relayout(plot, {annotations: annotations});
        }
    });

    document.getElementById('inputNumber').addEventListener('change', function(){
        var newX = Number(this.value);
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
    });
</script>
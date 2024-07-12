<script>
    var graphJson = {{ graph_json|safe }};
    var graphDiv = document.getElementById('graph');
    var annotationEnabled = false;
    var annotation;

    // Plotly 그래프 그리기
    Plotly.plot(graphDiv, graphJson.data, graphJson.layout);

    // 클릭 이벤트 핸들러
    graphDiv.on('plotly_click', function(data){
        if (annotationEnabled) {
            addAnnotation(data.points[0].x, data.points[0].y);
        }
    });

    // Annotation 추가 함수
    function addAnnotation(x, y) {
        var pointInfo = Selected Point: (${x}, ${y});

        // 기존 annotation 삭제
        var annotations = graphDiv.getElementsByClassName('annotation');
        for (var i = 0; i < annotations.length; i++) {
            annotations[i].parentNode.removeChild(annotations[i]);
        }

        // 새로운 annotation 추가
        annotation = {
            x: x,
            y: y,
            xref: 'x',
            yref: 'y',
            text: pointInfo,
            showarrow: true,
            arrowhead: 7,
            ax: 0,
            ay: -40,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: '#007bff',
            borderwidth: 1,
            opacity: 0.9,
            font: {
                family: 'Arial, sans-serif',
                size: 14,
                color: '#007bff'
            },
            align: 'center',
            xanchor: 'center',
            yanchor: 'bottom',
            width: 200,
            height: 40,
            valign: 'middle'
        };

        Plotly.relayout(graphDiv, {annotations: [annotation]});
    }

    // Annotation 토글 버튼 클릭 이벤트
    document.getElementById('toggleAnnotation').addEventListener('click', function() {
        annotationEnabled = !annotationEnabled;
        if (!annotationEnabled) {
            // annotation 삭제
            var annotations = graphDiv.getElementsByClassName('annotation');
            for (var i = 0; i < annotations.length; i++) {
                annotations[i].parentNode.removeChild(annotations[i]);
            }
        } else {
            // annotation 추가
            if (annotation) {
                Plotly.relayout(graphDiv, {annotations: [annotation]});
            }
        }

        // 버튼 텍스트 업데이트
        this.textContent = 'Annotation ' + (annotationEnabled ? 'Off' : 'On');
    });

    // 입력 폼에서 숫자 입력 실시간 반영 (백스페이스 처리)
    var inputNumber = document.getElementById('inputNumber');
    var lastValidValue = inputNumber.value; // 최근 유효한 값 저장

    inputNumber.addEventListener('input', function() {
        var inputValue = this.value.trim(); // 입력 값 양쪽 공백 제거

        // 입력 값이 변경된 경우에만 처리
        if (inputValue !== lastValidValue) {
            lastValidValue = inputValue; // 최근 유효한 값 업데이트

            if (inputValue) {
                var xValue = parseFloat(inputValue);
                var yValue;

                // 데이터에서 x값에 해당하는 y값 찾기
                graphJson.data[0].x.forEach(function(x, index) {
                    if (x == xValue) {
                        yValue = graphJson.data[0].y[index];
                    }
                });

                if (yValue !== undefined) {
                    addAnnotation(xValue, yValue);
                } else {
                    // 해당 x 값에 대응하는 데이터가 없는 경우 처리
                    clearAnnotation();
                    alert('해당 x 값에 대응하는 데이터가 없습니다.');
                }
            } else {
                // 입력 값이 빈 문자열인 경우 처리
                clearAnnotation();
            }
        }
    });

    // 주석 삭제 함수
    function clearAnnotation() {
        // 기존 annotation 삭제
        var annotations = graphDiv.getElementsByClassName('annotation');
        for (var i = 0; i < annotations.length; i++) {
            annotations[i].parentNode.removeChild(annotations[i]);
        }
    }
</script>
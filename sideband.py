# app.py
from flask import Flask, render_template, request
import plotly.graph_objs as go

app = Flask(__name__)

# 초기 데이터 설정
initial_x_data = [0, 1, 2, 3, 4, 5]
initial_y_data = [0, 1, 4, 9, 16, 25]

# 기본 그래프 생성
def create_graph(x_data, y_data):
    graph = go.Figure(
        data=[go.Scatter(x=x_data, y=y_data, mode='lines+markers', name='line chart')],
        layout=go.Layout(title='Flask with Plotly Line Chart')
    )
    return graph

# 초기 그래프 생성
graph = create_graph(initial_x_data, initial_y_data)

@app.route('/', methods=['GET', 'POST'])
def index():
    global graph

    # POST 요청일 때 입력값 받아와서 그래프 업데이트
    if request.method == 'POST':
        new_value = request.form['new_value']
        print(new_value)

    # 그래프를 JSON 형식으로 변환하여 템플릿으로 전달
    graph_json = graph.to_json()

    return render_template('sideband.html', graph_json=graph_json)

if __name__ == '__main__':
    app.run(debug=True)

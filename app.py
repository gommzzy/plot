# app.py
from flask import Flask, render_template, jsonify, request
from graph import get_channel_name, draw_trend_waveform, \
    draw_trend_waveform_3d, draw_graph_waveform, \
    draw_multi_waveform, overall, generate_trend_spectrum, generate_non_trend_spectrum
from sidebar import get_directory_structure, get_base_dir
import os

app = Flask(__name__)


@app.route('/directory_structure')
def directory_structure():
    base_dir = get_base_dir()
    structure = get_directory_structure(base_dir)
    return jsonify(structure)


@app.route('/sidebar/channel')
def get_channel_names():
    path = request.args.get('path', '')
    channel_names = []
    for chName in get_channel_name(path):
        if chName not in channel_names:
            channel_names.append(chName)
    return jsonify(channel_names)



@app.route('/')
def index():
    # Redirect to trend page by default
    return page_type_index('trend')


@app.route('/<page_type>')
def page_type_index(page_type):
    if page_type not in ['trend', 'single', 'dual', 'multi']:
        return "Invalid page type", 404
    base_dir = get_base_dir()
    structure = get_directory_structure(base_dir)
    return render_template('main.html', structure=structure, page_type=page_type)


@app.route('/draw/<page_type>')
def graph_draw(page_type):
    try:
        if page_type not in ['trend', 'single', 'dual', 'multi']:
            return "Invalid page type", 404
        path = request.args.get('path')
        channel_name = request.args.get('chName')
        plot_type = int(request.args.get('plotType', 1))
        peak = int(request.args.get('peakType', 1))
        # peak = 1
        plots = []

        if page_type == "trend":
            if plot_type == 1:
                plots = overall(path, channel_name)
            elif plot_type == 2:
                plots += draw_trend_waveform(path, channel_name)
                plots += draw_trend_waveform_3d(path, channel_name)
            elif plot_type == 3:
                plots += generate_trend_spectrum(path, channel_name, peak=peak)
                plots += generate_trend_spectrum(path, channel_name, peak=peak, threeD=1)
        elif page_type == "single":
            if plot_type == 1:
                plots = draw_graph_waveform(path)
            elif plot_type == 2:
                plots = generate_non_trend_spectrum(path, peak=peak, multi=0)
        elif page_type == "dual":
            waveform_plots = draw_graph_waveform(path)
            spectrogram_plots = generate_non_trend_spectrum(path, peak=peak, multi=0)
            plots = waveform_plots + spectrogram_plots
        elif page_type == "multi":
            if plot_type == 1:
                plots = draw_multi_waveform(path)
            elif plot_type == 2:
                plots = plots = generate_non_trend_spectrum(path, peak=peak, multi=1)
        return jsonify(plots)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)

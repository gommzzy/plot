import os
from nptdms import TdmsFile
import numpy as np
import plotly.graph_objs as go
import time

PEAK_VALUE = 1.414


''' 데이터 처리 및 단위 변환 '''


def unit(graph_type, ni_unit, peak=1):
    unit_x_y = []
    x_labels = {
        "waveform": "Time (ms)",
        "spectrum": "Frequency (Hz)",
        "overall": "Frequency (Hz)"
    }
    y_labels = {
        ("waveform", "m/s^2"): "Amplitude (m/s²)",
        ("waveform", "Meters"): "Amplitude (μm)",

        ("spectrum", "m/s^2"): "Amplitude (mm/s RMS)",
        ("spectrum", "Meters", 1): "Amplitude (μm pk)",
        ("spectrum", "Meters", 2): "Amplitude (μm p-p)",

        ("overall", "m/s^2"): "Amplitude (mm/s RMS)",
        ("overall", "Meters", 1): "Amplitude (μm pk)",
        ("overall", "Meters", 2): "Amplitude (μm p-p)"
    }

    unit_x_y.append(x_labels.get(graph_type, ""))
    unit_y_key = (graph_type, ni_unit, peak) if (graph_type, ni_unit, peak) in y_labels else (graph_type, ni_unit)
    unit_x_y.append(y_labels.get(unit_y_key, ""))

    return unit_x_y


def format_tdms_filename_to_time(tdms_filename):
    time_str = tdms_filename.replace('.tdms', '')
    hours = time_str[0:2]
    minutes = time_str[2:4]
    seconds = time_str[4:6]
    return f"{hours}:{minutes}:{seconds}"

def get_channel_name(file_path):
    data = read_all_tdms_data(file_path)
    channel_names = []
    for channel_unit, channel_name, channel_data in data:
        channel_names.append(channel_name)
    return channel_names


def read_all_tdms_data(file_path):
    start = time.time()
    data = []

    with TdmsFile.read(file_path) as tdms_file:
        groups = tdms_file.groups()
        for group in groups:
            channels = group.channels()
            for channel in channels:
                channel_name = channel.properties['NI_ChannelName']
                channel_unit = channel.properties['unit_string']
                data.append([channel_unit, channel_name, channel[:]])
    end = time.time()
    print("read tdms : ", end - start)

    return data


def read_specific_tdms_data(file_path, channel_name):
    data = []
    file_name = os.path.basename(file_path)[:-5]

    with TdmsFile.read(file_path) as tdms_file:
        groups = tdms_file.groups()
        for group in groups:
            channels = group.channels()
            for channel in channels:
                if channel.properties['NI_ChannelName'] == channel_name:
                    data = [file_name,  channel.properties['unit_string'],  channel[:]]
                    break

    return data

# tdms 파일주소, 채널명 받아옴
# tdms 파일명 순으로 선택된곳 부터 10개 데이터 불러옴
# 해당 파일안에 채널있으면 해당 채널 데이터를 보냄

# 반환할때 [['112650', 'Meters', array([ 1],['112650', 'Meters', array([ 1]]
def read_directory_channel_data(path, channel_name, limit=10):
    data = []
    file_paths = []

    parent_dir = os.path.dirname(path)
    for root, _, files in os.walk(parent_dir):
        for file in files:
            if file.endswith('.tdms'):
                file_paths.append(os.path.join(root, file))

    for i in range(0, len(file_paths)):
        if file_paths[i] == path:
            if i + limit <= len(file_paths):
                file_paths = file_paths[i:i + limit]
            else:
                file_paths = file_paths[i:]
            break

    # tdms 파일에서 채널명 같은거 데이터 저장 (file명, 유닛명, 채널밸류)
    for file_path in file_paths:
        tdms_data = read_specific_tdms_data(file_path, channel_name)
        if len(tdms_data):
            data.append(tdms_data)
    return data


def integral(values):
    integrated_values = []
    for channel_name, channel_value in values:
        dt = 1.0 / (len(channel_value) - 1)
        velocity = np.cumsum(channel_value) * dt
        integrated_values.append([channel_name, velocity])
    return integrated_values


def fft(data, normalization=True, skip=0, fft_range=None, res=None, peak=1):
    fft_data_dict = []

    for key, datas in data:
        datas = datas * np.hanning(datas.shape[-1]) * 2  # 2는 보정 계수

        n = int(datas.shape[-1] * res) if res else datas.shape[-1]

        fft_result = np.fft.rfft(datas, n=n)  # np fft를 사용
        fft_result = np.abs(fft_result) * 0.7071067811865475

        fft_result = fft_result * peak * 1.414

        if fft_range is not None:
            fft_range_adj = [int(fft_range[0] * res), int(fft_range[1] * res)] if res else fft_range
            fft_result = fft_result[:, fft_range_adj[0]:fft_range_adj[1]]

        if normalization:
            fft_result = fft_result / (np.shape(datas)[-1] * 0.5)

        if skip != 0:
            fft_result[:, 0:skip] = 0.

        fft_data_dict.append([key, fft_result])

    return fft_data_dict


''' 시각화 및 주파수 분석'''


def draw_graph_waveform(tdms_file_path):
    data = read_all_tdms_data(tdms_file_path)
    unit_to_channels = {}
    plots = []

    for channel_unit, channel_name, channel_data in data:
        if channel_unit not in unit_to_channels:
            unit_to_channels[channel_unit] = []
        unit_to_channels[channel_unit].append((channel_name, channel_data))

    for channel_unit, channels in unit_to_channels.items():
        fig = go.Figure()
        unit_x_y = unit('waveform', channel_unit)
        for channel_name, channel_data in channels:
            fig.add_trace(go.Scatter(x=np.arange(len(channel_data)), y=channel_data, mode='lines', name=channel_name))
        fig.update_layout(
            title=f'Unit: {channel_unit}',
            xaxis_title=unit_x_y[0],
            yaxis_title=unit_x_y[1],
            height=600,
            legend=dict(
                orientation='h',
                yanchor='bottom',
                y=-0.3,
            )
        )
        plot_div = fig.to_html(full_html=False, config={'displaylogo': False})
        plots.append(plot_div)

    return plots


def draw_trend_waveform_3d(parent_file_path, channel_name):
    data = read_directory_channel_data(parent_file_path, channel_name)
    unit_x_y = []

    tdms_file_max = 5
    if len(data) > tdms_file_max:
        data = data[:tdms_file_max]

    fig = go.Figure()
    for entry in data:
        file_name = entry[0]
        unit_string = entry[1]
        channel_values = entry[2]
        unit_x_y = unit('waveform', unit_string)

        y_values = np.arange(len(channel_values))
        fig.add_trace(go.Scatter3d(x=[format_tdms_filename_to_time(file_name)] * len(y_values),
                                   y=y_values, z=channel_values, mode='lines',
                                   name=format_tdms_filename_to_time(file_name)))

    fig.update_layout(
        title=f'3D Waveform Graph for Channel: {channel_name}',
        scene=dict(xaxis_title='', yaxis_title=unit_x_y[0], zaxis_title=unit_x_y[1]),
        height=500
    )

    plot_div = fig.to_html(full_html=False, config={'displaylogo': False})
    return [plot_div]


def draw_trend_waveform(parent_file_path, channel_name):
    data = read_directory_channel_data(parent_file_path, channel_name, 5)
    plots = []

    for entry in data:
        fig = go.Figure()
        file_name = entry[0]
        unit_string = entry[1]
        channel_values = entry[2]
        unit_x_y = unit('waveform', unit_string)
        y_values = np.arange(len(channel_values))
        fig.add_trace(go.Scatter(x=y_values,
                                 y=channel_values,
                                 mode='lines',
                                 name=format_tdms_filename_to_time(file_name)))
        fig.update_layout(
            title=f'Waveform Graph for times: {format_tdms_filename_to_time(file_name)}',
            xaxis_title=unit_x_y[0], yaxis_title=unit_x_y[1],
            height=500
        )
        plot_div = fig.to_html(full_html=False, config={'displaylogo': False})
        plots.append(plot_div)

    return [plots]


def draw_multi_waveform(tdms_file_path):
    data = read_all_tdms_data(tdms_file_path)
    plots = []

    for channel_unit, channel_name, channel_data in data:
        unit_x_y = unit('waveform', channel_unit)
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=np.arange(len(channel_data)), y=channel_data, mode='lines', name=channel_name))
        fig.update_layout(xaxis_title=unit_x_y[0], yaxis_title=unit_x_y[1], height=400, title=channel_name)
        plot_div = fig.to_html(full_html=False, config={'displaylogo': False})
        plots.append(plot_div)
    return plots


def generate_trend_spectrum(parent_file_path, channel_name, peak=1, threeD=0):
    # [[filename, unit, values]]
    preprocessed_data = {}
    displacement_channels = []
    acceleration_channels = []
    integrated_values = []
    data = read_directory_channel_data(parent_file_path, channel_name)

    for file_name, ch_unit, ch_values in data:
        if ch_unit == 'm/s^2':
            acceleration_channels.append([file_name,ch_values])
            integrated_values = integral(acceleration_channels)
        elif ch_unit == 'Meters':
            displacement_channels.append([file_name,ch_values])

    fft_acceleration = fft(integrated_values, peak=peak)
    fft_displacement = fft(displacement_channels, peak=peak)
    if fft_acceleration:
        preprocessed_data['m/s^2'] = fft_acceleration
    if fft_displacement:
        preprocessed_data['Meters'] = fft_displacement

    if threeD:
        return create_3d_spectrum_graph(preprocessed_data,channel_name)
    else:
        return create_2d_spectrum_graph(preprocessed_data)


def generate_non_trend_spectrum(tdms_file_path, peak=1, multi=0):
    acceleration_channels = []
    displacement_channels = []
    integrated_values = []
    preprocessed_data = {}

    data = read_all_tdms_data(tdms_file_path)

    for ch_unit, ch_name, ch_data in data:
        if ch_unit == 'm/s^2':
            acceleration_channels.append([ch_name, ch_data])
            integrated_values = integral(acceleration_channels)
        elif ch_unit == 'Meters':
            displacement_channels.append([ch_name,ch_data])

    fft_acceleration = fft(integrated_values, peak=peak)
    fft_displacement = fft(displacement_channels, peak=peak)

    if fft_acceleration:
        preprocessed_data['m/s^2'] = fft_acceleration
    if fft_displacement:
        preprocessed_data['Meters'] = fft_displacement

    if multi:
        return create_multi_spectrum_graph(preprocessed_data)
    else:
        return create_spectrum_graph(preprocessed_data)


def create_3d_spectrum_graph(data,channel_name):
    plots = []
    fig = go.Figure()
    for channel_unit, channels in data.items():
        unit_x_y = unit('spectrum', channel_unit)
        for file_name, channel_data in channels:
            y_values = np.arange(len(channel_data))
            fig.add_trace(go.Scatter3d(x=[format_tdms_filename_to_time(file_name)] * len(channel_data),
                                       y=y_values, z=channel_data, mode='lines',
                                       name=format_tdms_filename_to_time(file_name)))

        fig.update_layout(
            title=f'3D Waveform Graph for Channel: {channel_name}',
            scene=dict(xaxis_title='', yaxis_title=unit_x_y[0], zaxis_title=unit_x_y[1]),
            height=500
        )

    plot_div = fig.to_html(full_html=False, config={'displaylogo': False})
    return [plot_div]


def create_2d_spectrum_graph(data):
    plots = []
    for channel_unit, channels in data.items():
        unit_x_y = unit('spectrum', channel_unit)
        for file_name, channel_data in channels:
            fig = go.Figure()
            y_values = np.arange(len(channel_data))
            fig.add_trace(go.Scatter(x=y_values, y=channel_data, mode='lines',
                                     name=format_tdms_filename_to_time(file_name)))
            fig.update_layout(
                title=f'spectrum Graph for times: {format_tdms_filename_to_time(file_name)}',
                xaxis_title=unit_x_y[0], yaxis_title=unit_x_y[1],
                height=500
            )
            plot_div = fig.to_html(full_html=False, config={'displaylogo': False})
            plots.append(plot_div)

    return [plots]


def create_spectrum_graph(data):
    plots = []
    for channel_unit, channels in data.items():
        fig = go.Figure()
        unit_x_y = unit('spectrum', channel_unit)
        for channel_name, channel_data in channels:
            fig.add_trace(
                go.Scatter(x=np.arange(len(channel_data)), y=channel_data, mode='lines', name=channel_name))
        fig.update_layout(
            title=f'Unit: {channel_unit}',
            xaxis_title=unit_x_y[0],
            yaxis_title=unit_x_y[1],
            height=600,
            legend=dict(
                orientation='h',
                yanchor='bottom',
                y=-0.3,
            )
        )
        plot_div = fig.to_html(full_html=False, config={'displaylogo': False})
        plots.append(plot_div)

    return plots


def create_multi_spectrum_graph(data):
    plots = []
    for channel_unit, channels in data.items():
        unit_x_y = unit('spectrum', channel_unit)
        for channel_name, channel_data in channels:
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=np.arange(len(channel_data)), y=channel_data, name=channel_name, mode='lines'))
            fig.update_layout(title=f'spectrum - {channel_name}',
                              xaxis_title=unit_x_y[0],
                              yaxis_title=unit_x_y[1],
                              yaxis=dict(type='linear'),
                              height=600,
                              legend=dict(orientation='h', yanchor='bottom', y=-0.3)
                              )
            plot_div = fig.to_html(full_html=False, config={'displaylogo': False})
            plots.append(plot_div)

    return plots


def overall(parent_file_path, channel_name):
    data = read_directory_channel_data(parent_file_path, channel_name)
    units = ''
    file_values = []
    for entry in data:
        units = entry[1]
        file_values.append([entry[0],entry[2]])
    unit_x_y = unit('overall',units)

    fft_values = fft(file_values)
    overall_values = []
    overall = lambda x: np.sum(x ** 2, axis=-1) ** 0.5
    for file_name, values in fft_values:
        overall_values.append([file_name,overall(values)])

    x_values = [file_name for file_name, value in overall_values]
    y_values = [value for file_name, value in overall_values]

    fig = go.Figure()
    fig.add_trace(go.Scatter(x=x_values, y=y_values, mode='lines+markers'))
    fig.update_layout(
        title=f"overall Data : {channel_name}",
        xaxis_title=unit_x_y[0],
        yaxis_title=unit_x_y[1], height=650
    )
    plot_div = fig.to_html(full_html=False, config={'displaylogo': False})
    return [plot_div]


file_path4 = r'TDMS Data\Motor\074-Inspection Folder\2024-07-09\300000.tdms'
file_path3 = r'TDMS Data\Motor\074-Inspection Folder\2024-06-28\115123.tdms'
file_path2 = r'TDMS Data\Motor\074-Inspection Folder\2024-05-17\112750.tdms'
folder_path = r'TDMS Data\Motor\074-Inspection Folder\2024-05-17'
folder_path2 = r'TDMS Data\Motor\074-Inspection Folder\2024-06-28'
chName = '074_Turbine-Generator_Turbine_TIH'
chName2 = '003_Only Turbine(Disp-Acc)_Turbine(Acc)_TACHO'

# print(read_directory_channel_data(file_path2,chName))


# print(generate_trend_spectrum(r'TDMS Data\Motor\074-Inspection Folder\2024-05-17','074_Turbine-Generator_Turbine_TIH'))
# trend_spectrum(folder_path, chName)

# non_trend_spectrum(file_path3)
# overall(folder_path2, chName2)
# print(trend_def(folder_path,chName))
# print(read_all_tdms_data2(file_path,chName))
# draw_trend_waveform_3d(folder_path,chName)
# print(draw_trend_waveform_3d(folder_path2,chName2))
# print(draw_trend_overall(folder_path,chName))
# draw_multi_spectrogram(file_path)


# data = read_all_tdms_data(file_path4)
# print('원본데이터 : ')
# a = data[0][2]
# print(np.resize(a,20))
# arr = [['abc', data[0][2]]]
# np.set_printoptions(suppress=True)
#
# print('===============')
# print('acc fft : ')
# a = fft(arr)[0][1]
# print(np.resize(a,20))
# a = fft(integral(arr))[0][1]
# print('===============')
# print('vel fft : ')
# print(np.resize(a,20))

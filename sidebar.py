import os

BASE_DIR = r'TDMS Data'

def get_base_dir():
    return BASE_DIR

def get_directory_structure(base_dir):
    structure = []
    for entry in os.listdir(base_dir):
        full_path = os.path.join(base_dir, entry)
        if os.path.isdir(full_path):
            structure.append({
                'name': entry,
                'type': 'directory',
                'path': full_path,
                'children': get_directory_structure(full_path)
            })
        else:
            structure.append({
                'name': entry,
                'type': 'file',
                'path': full_path
            })
    return structure

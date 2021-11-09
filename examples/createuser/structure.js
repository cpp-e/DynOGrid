var accountStruct = {
    'team': {'type': 'list', 'value': '@arch'},
    'name': {'type': 'input', 'case': 'lower'},
    'description': {'type': 'hidden', 'value': '>team'},
    'package': {'type': 'list', 'value': '@arch[">team"]["packages"]'},
    'package_id': {'type': 'readonly', 'value': '$arch[">team"]["packages"][">package"]["id"]'},
    'userpath': {'type': 'readonly', 'value': '$arch[">team"]["BasePath"]$arch[">team"]["packages"][">package"]["path"]/>name'}
};
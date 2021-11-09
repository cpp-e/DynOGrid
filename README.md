# DynOGrid
Converts HTML table to Dynamic Grid with the ability to connect row fields to each other.

## Installation
```bash
npm install dynogrid
```

## Usage
```html
<script src="DynOGrid-1.0.0.min.js" />
<button id="btnAdd">Add</button>
<table id="mytable">
<script>
    var arch = {
        'devs': {
            'BasePath': '/devs',
            'packages': {
                'dynogrid':{
                    'id': 10,
                    'path': '/DynOGrid'
                },
                'tbd':{
                    'id': 11,
                    'path': '/TBD'
                }
            }
        },
        'testers': {
            'BasePath': '/testers',
            'packages': {
                'dynogrid':{
                    'id': 20,
                    'path': '/DynOGrid'
                },
                'tbd':{
                    'id': 11,
                    'path': '/TBD'
                }
            }
        }
    };
    var mystructure = {
        'team': {'type': 'list', 'value': '@arch'},
        'name': {'type': 'input', 'case': 'lower'},
        'description': {'type': 'hidden', 'value': '>team'},
        'package': {'type': 'list', 'value': '@arch[">team"]["packages"]'},
        'package_id': {'type': 'readonly', 'value': '$arch[">team"]["packages"][">package"]["id"]'},
        'userpath': {'type': 'readonly', 'value': '$arch[">team"]["BasePath"]$arch[">team"]["packages"][">package"]["path"]/>name'}
    };
    d$('#mytable', mystructure);
    document.querySelector('#btnAdd').addEventListener('click', function(){
		d$('#mytable').add();
	});
</script>
```

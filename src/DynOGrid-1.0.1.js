/*!
 * DynOGrid v1.0.1
 * https://github.com/cpp-e/DynOGrid
 *
 * (c) Copyright cpp-e
 * Released under the GPL-3.0 license
 * https://github.com/cpp-e/DynOGrid/blob/main/LICENSE
 *
 * Date: 2021-11-09
 */
(function(global, factory){
	"use strict";
	typeof module === "object" && typeof module.exports === "object" ? module.exports = global.document ? factory() : function(w){
		if (!w.document)
			throw new Error("DynOGrid requires a window with a document");
		return w.DynOGrid = w.d$ = factory();
	} : global.DynTable = global.d$ = factory();
})( window || this, function(){
"use strict";

let version = "1.0.1";

function closest(elm, selector){
	if(elm.closest)
		return elm.closest(selector);
	let matches = Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector || undefined;
	if(typeof matches === 'undefined')
		throw new Error("DynOGrid is not supported on you browser");
	do {
		if (matches.call(elm, selector))
			return elm;
		elm = elm.parentElement || elm.parentNode;
	} while (elm !== null && elm.nodeType === 1);
	return null;
}

function includes(array, searchElement, fromIndex){
	return array.includes ? array.includes(searchElement, fromIndex) : (array.indexOf(searchElement, fromIndex) > -1);
}

function expandObj(dst, from){
	let obj = dst && typeof dst === 'object' && Object.keys(dst).length > 0 ? expandObj({}, dst) : {};
	for(let key in from)
		if(!obj.hasOwnProperty(key))
			obj[key] = from[key];
	return obj;
}

let defaultOptions = {
	'actionCell': true,
	'actionCellHeader': "Actions",
	'actionCellButtons': [{'text': 'Delete', 'action': 'delete'}],
};

function resolveVar(v){
	let type = v[0];
	let vr = v.substring(1);
	let vars = v.match(/[$@][a-zA-Z0-9_]+(\["[^$@]+"\])*/g);
	for(let i = 0; vars && vars.length > 1 && i < vars.length; ++i){
		let res = resolveVar(vars[i]);
		v = v.replace(vars[i], typeof res === 'array' ? res[0] : res);
	}
	return type === '$' ? vars.length > 1 ? v : eval(vr) : Object.keys(eval(vr));
}

function updateField(elm, dyn, tr){
	let key = elm.id;
	let command = dyn.structure[key]['value'];
	let references = command.match(/>[a-zA-Z0-9_]+/g);
	for(let i = 0; references && i < references.length; ++i){
		let ref = references[i].substring(1);
		if(dyn.structure.hasOwnProperty(ref) && ref != key)
			command = command.replace('>' + ref, tr.querySelector('#' + ref).value);
	}
	let vars = command.match(/[$@][a-zA-Z0-9_]+(\[".*"\])*/g);
	if(dyn.structure[key]['type'].toLowerCase() === 'list' && vars){
		let res = resolveVar(vars[0]);
		elm.innerHTML = '';
		if(typeof res === 'string'){
			let option = document.createElement('option');
			option.innerText = res;
			elm.appendChild(option);
		} else {
			for (let i = 0; i < res.length; ++i){
				let option = document.createElement('option');
				option.innerText = res[i];
				elm.appendChild(option);
			}
		}
	} else {
		for(let i = 0; vars && i < vars.length; ++i){
			let res = resolveVar(vars[i]);
			command = command.replace(vars[i], typeof res === 'array' ? res[0] : res);
		}
		elm.value = command;
	}
}

function updateFields(e){
	let elm = e.target || e;
	let tr = closest(elm, 'tr');
	let dyn = DynOGrid(closest(tr, 'table'));
	let refs = dyn.structure[elm.id].referencedIn;
	for(let i = 0; i < refs.length; ++i){
		let el = tr.querySelector('#' + refs[i]);
		setTimeout(function(){
			updateField(el, dyn, tr);
		});
	}
}

function DynOGrid(elm, structure, options){
	let elem = elm && elm.nodeType && elm.nodeType === 1 ? elm : typeof elm === "string" ? document.querySelector(elm) : undefined;
	if(typeof elem === 'undefined' || elem.tagName.toLowerCase() !== "table")
		throw new Error("Table element must be passed as first argument for DynOGrid");
	if(!(this instanceof DynOGrid))
		if(elem.hasOwnProperty(DynOGrid.expando))
			return elem[DynOGrid.expando];
		else
			return new DynOGrid(elem, structure, options)
	this.elm = elem;
	this.structure = typeof structure === "object" ? structure : undefined;
	this.options = expandObj(typeof options === "object" ? options : {}, defaultOptions);
	
	if(!this.structure)
		throw new Error("Structure object must be passed as second argument for DynOGrid to build the table");
	
	let tr = document.createElement('tr');
    for(let key in this.structure){
		let th = document.createElement('th');
		th.innerText = key;
		tr.appendChild(th);
		if (this.structure[key]['type'].toLowerCase() === 'hidden')
			th.style.display = 'none';
		if(!this.structure[key].hasOwnProperty('referencedIn'))
			this.structure[key]['referencedIn'] = [];
		if (this.structure[key].hasOwnProperty('value')){
			if (this.structure[key]['type'].toLowerCase() === 'list' && !this.structure[key]['value'].match(/^([$@][a-zA-Z0-9_]+(\[".*"\])*)?$/))
				throw new Error('The value for a list cannot be a built up string!');
			let references = this.structure[key]['value'].match(/>[a-zA-Z0-9_]+/g);
			for(let i = 0; references && i < references.length; ++i){
				let ref = references[i].substring(1);
				if(this.structure.hasOwnProperty(ref) && ref != key){
					if(!this.structure[ref].hasOwnProperty('referencedIn'))
						this.structure[ref]['referencedIn'] = [];
					if(includes(this.structure[key]['referencedIn'], ref))
						throw new Error("Unsupported reference: Circular reference detected between " + key + ' and ' + ref);
					if(!includes(this.structure[ref]['referencedIn'], key))
						this.structure[ref]['referencedIn'].push(key);
				}
			}
		}
	}
	if(this.options['actionCell']){
		let th = document.createElement('th');
		th.innerText = this.options['actionCellHeader'];
		tr.appendChild(th);
	}
    this.elm.appendChild(tr);
	this.elm[DynOGrid.expando] = this;
}

DynOGrid.expando = 'DynOGrid_v' + (version + Math.random()).replace(/\D/g,'');
DynOGrid.version = 'DynOGrid ' + version;

DynOGrid.prototype = {
	constructor: DynOGrid,
	__actions: {
		get __predefined(){
			let keys = Object.keys(this);
			keys.splice(keys.indexOf('__predefined'), 1);
			return keys;
		},
		delete: function(ev){
			closest(ev.target, 'table').removeChild(closest(ev.target, 'tr'));
		}
	},
	add: function(){
		let _self = this;
		let tr = document.createElement('tr');
        _self.elm.appendChild(tr);
		
		for(let key in _self.structure){
			let td = document.createElement('td');
			if(_self.structure[key]['type'].toLowerCase() === 'hidden')
				td.style.display = 'none';
			tr.appendChild(td);
			let elm = document.createElement(_self.structure[key]['type'] === 'list' ? 'select' : 'input');
			elm.setAttribute('id', key);
			if(elm.tagName.toLowerCase() === 'input'){
				if(_self.structure[key]['type'].toLowerCase() === 'readonly')
					elm.setAttribute('readonly', 'readonly');
			}
			elm.addEventListener('change', updateFields);
			td.appendChild(elm);
		}
		for(let key in _self.structure)
			if(_self.structure[key]['referencedIn'].length){
				if (_self.structure[key]['type'].toLowerCase() === 'list')
					updateField(tr.querySelector('#' + key), _self, tr);
				updateFields(tr.querySelector('#' + key));
			}
		if(_self.options['actionCell']){
			let td = document.createElement('td');
			for(let i = 0; i < _self.options['actionCellButtons'].length; ++i){
				let btn = document.createElement('button');
				btn.innerText = _self.options['actionCellButtons'][i]['text'];
				btn.addEventListener('click',
					typeof _self.options['actionCellButtons'][i]['action'] === 'string' && 
					includes(_self.__actions['__predefined'], _self.options['actionCellButtons'][i]['action']) ? 
					_self.__actions[_self.options['actionCellButtons'][i]['action']] :
					_self.options['actionCellButtons'][i]['action']);
				td.appendChild(btn);
			}
			tr.appendChild(td);
		}
	},
	get value(){
		let rows = this.elm.querySelectorAll('tr');
		let ret = [];
        for( let i = 1; i < rows.length; ++i){
            let inputs = rows[i].querySelectorAll('input,select');
            let data = {};
            for(let j = 0; j < inputs.length; ++j)
                data[inputs[j].id] = inputs[j].value;
			ret.push(data);
		}
		return ret;
	},
	get json(){
		return JSON.stringify(this.value);
	}
}

DynOGrid.create = function(elm, structure, options){
	return new DynOGrid(elm, structure, options);
}

return DynOGrid;
});
/*
Copyright (C) 2012/2015 by XOSystem - Riccardo Della Martire <info@xosystem.org>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
 



/* da webstorm  23 */

/* apportata modifica */

/* altra modifica */


var DEVICE_WITH_TOUCH_EVENTS = "ontouchstart" in window;



var TRANSFER_DATA = null;

function SetTransferData( _object )
{
	TRANSFER_DATA = _object;
}

function GetTransferData()
{
	return TRANSFER_DATA;
}



/* NODES UTILS */
Node.prototype.getParentInGrandParent = function( _containerElement )
{
	if( this.parentNode == _containerElement) return this;
	if( this.parentNode !== null )  return this.parentNode.getParentInGrandParent( _containerElement );
	return null;
};

Node.prototype.getParentElementById = function( _id )
{
    if( this.parentNode.id == _id) return this.parentNode;
    if( this.parentNode !== null )  return this.parentNode.getParentElementById( _id );
    return null;
};

Node.prototype.getParentElementByClass = function( _className )
{
    if( this.parentNode.classList.contains(_className) ) return this.parentNode;
    if( this.parentNode !== null )  return this.parentNode.getParentElementByClass( _className );
    return null;
};

Node.prototype.removeChildren = function ()
{
	var myNode = this;
	while (myNode.firstChild){  myNode.removeChild(myNode.firstChild); }
};


//
//Node.prototype.__cloneNode = Node.prototype.cloneNode;
//
//Node.prototype.cloneNode = function( _deep ) {
//	var clonedNode = this.__cloneNode(_deep);
//
//	if(this.connectedControllers)
//	{
//		for(var i=0; i< this.connectedControllers.length; i++)
//		{
//			clonedNode.connectController(this.connectedControllers[i]);
//		}
//
//		for (var name in this) {
//			if (!(this[name] instanceof Function))
//			{
//				if (clonedNode[name] != this[name]) clonedNode[name] = this[name];
//			}
//		}
//	}
//
//	return clonedNode;
//};


CreateControllers = function(_root , _properties)
{
	_root = _root || document;
	var element,className;
	var elementList = _root.querySelectorAll('*[controller]');
	var undefinedControllers=[];

	for(var i=0; i<elementList.length; i++ )
	{
		element = elementList[i];
		className = element.getAttribute('controller');
		var controllerList = className.split(',');
		for(var j=0; j< controllerList.length; j++)
		{
			if( window[ controllerList[j] ]  )
			{
				element.connectController(  window[ controllerList[j] ] , _properties );
			}
			else
			{
				undefinedControllers.push( {element: element, className:'/* class constructor */\nfunction '+className+'(_e)\n{\n/* constructor code */\n};\n\n_ = '+controllerList[j]+'.prototype;'} );
			}
		}
	}

	if(undefinedControllers.length>0)
	{
		for( i=0; i<undefinedControllers.length; i++ )
		{
			console.warn("Undefined class/controllers for:" , undefinedControllers[i].element );
			console.log(undefinedControllers[i].className);
		}
	}

	return elementList;
};


Node.prototype.connectController = function(_class, _properties)
{
	for(var name in _class.prototype)
	{
		if(name!='constructor')
		{
			if(this[name]) console.warn('The methods "' + name +'" already exists in', this );
			this[name]=_class.prototype[name];
		}
	}
	_class.call( this , _properties || {} );

	if(!this.connectedControllers)this.connectedControllers = [];

	this.connectedControllers.push(_class);

	return this;
};

Node.prototype.connectEvents = function(_controller)
{
	_controller = _controller || this;

	var eventList, eventData, eventName, functionName, functionListener , element, elementList = this.querySelectorAll('[event]');

	var connectedElements={};
	var undefinedEventListeners=[];

	function selectText() { this.select(); } // connesso al click, seleziona l'intero testo contenuto nel campo di testo

	for(var id=0; id<elementList.length; id++)
	{
		element = elementList[id];
		eventList = element.getAttribute('event').split(';');

		if(eventList.length>0)
		{
			for(var idEvent=0; idEvent<eventList.length; idEvent++)
			{
				eventData = eventList[idEvent].split(':');
				eventName = eventData[0].trim();
				functionName = eventData[1].trim();
				functionListener = _controller[ functionName ];
				if( functionListener )
				{
					ConnectEvent ( eventName , element , functionListener , _controller );
				}
				else{
					//console.warn('Can\'t connect the event:' + eventName + ' with the function ' + functionName );
					undefinedEventListeners.push( '_.'+functionName+' = function(_e){\n};' );
					//console.log('_.'+functionName+' = function(_e){\n};');
				}
			}

			if(element.hasAttribute('name')) connectedElements[ element.getAttribute('name') ] = element;

			if( (element.nodeName == 'INPUT') && (element.getAttribute('type')=='text') )  ConnectEvent ( "click" ,  element , selectText );

		}
	}


	if(undefinedEventListeners.length>0)
	{
		console.warn("Undefined event listeners in element/controller:" , _controller);
		console.log(undefinedEventListeners.join('\n\n'));
	}

	return connectedElements;
};










// selectable-items 

function SelectElement( _element , _mode )
{

	_mode = _mode || 'radio';

	if(_mode=='radio')
	{
		//var selectedElements = [];
		var id = '';
		if(_element.parentNode.hasAttribute('id'))
		{
			id = _element.parentNode.getAttribute('id');
		}else{
			id = 'TEMP_'+ new Date().getTime();
			_element.parentNode.setAttribute('id',id);
		}

		var selectedElements = _element.parentNode.parentNode.querySelectorAll('#'+id+'>.selected');

		for(var i= 0, max=selectedElements.length; i<max; i++) selectedElements[i].classList.remove('selected');
		_element.classList.add('selected');
	}
	else if(_mode=='check')
	{
		_element.classList.toggle('selected');
	}

	if(_element.parentNode.onChange) _element.parentNode.onChange( _element );
}


function DeselectElements( _elementList  )
{
	for(var i= 0, max=_elementList.length; i<max; i++)_elementList[i].classList.remove('selected');
}




// hidden-items
function ShowElement( _element , _mode , _position )
{
	_mode = _mode || 'radio';

	if(_mode=='radio')
	{
		var showedElements = [];
		if(_element.parentNode.hasAttribute('id'))
		{
			var id = _element.parentNode.getAttribute('id');
			showedElements = _element.parentNode.parentNode.querySelectorAll('#'+id+'>.showed');
		}
		else
		{
			showedElements = _element.parentNode.querySelectorAll('.showed');
		}

		for(var i= 0, max=showedElements.length; i<max; i++) showedElements[i].classList.remove('showed');
		_element.classList.add('showed');
	}
	else if(_mode=='check')
	{
		_element.classList.toggle('showed');
	}
	else if(_mode=='always')
	{
		_element.classList.add('showed');
	}

	if(_element.onShow) _element.onShow();

	if(_position)
    {
        _element.style.left=_position.x+'px';  _element.style.top=_position.y+'px';	 
    }   
}      



function HideElements( _elementList  )
{
	for(var i=0, max=_elementList.length; i<max; i++)_elementList[i].classList.remove('showed');
}



/*  EVENT UTILS */
Event.prototype.preventPropagation = function()
{
     if (this.preventDefault) this.preventDefault();
     if (this.stopPropagation) this.stopPropagation();
	return false;
};
	


Event.prototype.responseToJSON = function()
{
	var xhr = this.target;
	try{ return window.JSON.parse( xhr.responseText); } catch(err) { return {result:'error',message: err + ' - response: '+xhr.responseText}; }
};


Event.prototype.getMousePoint = function()
{
	var _e = this;
	var pt = {x:0,y:0};

	if( DEVICE_WITH_TOUCH_EVENTS )
	{
		if (_e.targetTouches.length > 0)
		{
			pt.x = _e.targetTouches[0].pageX;
			pt.y = _e.targetTouches[0].pageY;
		}
	}
	else
	{
		if (!_e){  _e = window.event || window.Event }

		else if (_e.pageX || _e.pageY)
		{
			pt.x = _e.pageX;
			pt.y = _e.pageY;
		}
		else if (_e.layerX || _e.layerY)
		{
			pt.x = _e.layerX;
			pt.y = _e.layerY;
		}
		else if (_e.clientX || _e.clientY)
		{
			pt.x = _e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			pt.y = _e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
	}
	return pt;
};



//function DrawData( _containerTarget , _jsonItemsArray , _templateElement , _dataFilterCallback , _onDrawCallback )
function DrawData( _jsonItemsArray , _containerTarget , _templateElement , _dataFilterCallback , _onDrawCallback )
{
	var viewItem, dataItem;

	_containerTarget.removeChildren();

	var docFragment = document.createDocumentFragment();

	var max = _jsonItemsArray.length;
	for(var id=0; id<max; id++)
	{
		dataItem = _jsonItemsArray[id];
        if(_dataFilterCallback) dataItem = _dataFilterCallback(dataItem);
        if(dataItem.templateElement)
        {
            viewItem = dataItem.templateElement.cloneNode(true);
        }
        else
        {
            viewItem = _templateElement.cloneNode(true); 
        }	
		if(dataItem.id)viewItem.setAttribute('id' , dataItem.id );
		viewItem.data = dataItem;        
		//BindData( viewItem , dataItem );
        BindData( dataItem ,viewItem );
		docFragment.appendChild( viewItem );
		if(_onDrawCallback)_onDrawCallback(viewItem);
	}

	_containerTarget.appendChild(docFragment);

}


//function BindData( _elementsContainer , _objectValues, _queryAttribute  )
function BindData( _objectValues, _elementsContainer , _queryAttribute  )
{
	_queryAttribute = _queryAttribute || 'name' ;

	var _fieldElements = _elementsContainer.querySelectorAll( '['+_queryAttribute+']' );
	var fieldElement,fieldName,fieldValue;
	var max = _fieldElements.length;

	for(var id=0; id<max; id++)
	{
		fieldElement = _fieldElements[id];
		fieldName = fieldElement.getAttribute( _queryAttribute );
		fieldValue = _objectValues[ fieldName ];
		
		if( (fieldValue === null) || ( fieldValue === undefined ) ) fieldValue='';

		// se ha già una funzione "onBindData" usata per filtrare il valore e verrà chiamata passando l'intero record
		if(fieldElement.onBindData)
		{
			fieldElement.onBindData(_objectValues);
			continue;
		}
		
		switch( fieldElement.nodeName )
		{
			case 'INPUT':
                if((fieldElement.type == "radio") || (fieldElement.type == "checkbox") )
				{
					if(fieldValue==fieldElement.value) {fieldElement.checked = true;} else {fieldElement.checked = false;}
				}
				else
				{
					fieldElement.value = fieldValue;
				}
			break;				
			case 'SELECT':
				fieldElement.value = fieldValue;
			break;
			case 'DIV': case 'LI':
				if(fieldElement.hasAttribute('type'))
				{
					if(fieldElement.getAttribute('type')=='checkbox')
					{
						if(fieldValue===true) fieldElement.classList.add('selected'); else fieldElement.classList.remove('selected');
					}
				}
				else
				{
					fieldElement.innerHTML = fieldValue;
				}
				
			break;
			case 'TEXTAREA':
				fieldElement.value = fieldValue;
			break;
			case 'A':
				fieldElement.setAttribute('href', fieldValue) ;
			break;
			case 'IMG':
				fieldElement.setAttribute('src', fieldValue) ;
			break;
			default:
				
			break;	
		}
		
	}
}

/* example
	
   SendAndLoad( 'service.php' , new Blob(  [ JSON.stringify( mayObject ) ] , {type: 'application/json' } ), onLoadListener ); // invio di un file json come stringa
   SendAndLoad( 'service.php' , new Blob(  [ serializedText ], {type: 'text/svg'} ) , {type: 'text/svg'} ), onLoadListener ); // invio di un file SVG come stringa
   SendAndLoad( 'service.php' , new Blob(  [ document.innerHTML ], {type: 'text/html'} ) ), onLoadListener ); // invio del contenuto del documento stringa
   SendAndLoad( 'service.php' , new FormData( htmlForm ), onLoadListener ); // invio di una form html
   SendAndLoad('service.php', fileApiToUpload, onUploadComplete, onUploadError, onUploadProgress); // invio di un file api
   SendAndLoad('service.php', { firstName:"pippo", lastName:"pluto" }, onLoadListener ); // invio di variabili generiche	
*/


function SendAndLoad( _serviceUrl , _sendMethod , _dataToSend , _onLoadListener ,  _onErrorListener, _onLoadProgressListener, _onUploadProgressListener, _onAbortListener, _onBeforeSendCallback )
{	
	var xhr = new XMLHttpRequest();
		
	if(_onLoadListener) xhr.onload = _onLoadListener ;
    if(_onErrorListener) xhr.onerror = _onErrorListener;
	if(_onLoadProgressListener) xhr.onprogress = _onLoadProgressListener;
	if(_onUploadProgressListener) xhr.upload.onprogress = _onUploadProgressListener;	
	if(_onAbortListener) xhr.onabort = _onAbortListener;

	_sendMethod = _sendMethod || 'GET';

    var data='';
	
	if(_dataToSend)
	{
        if( ( (typeof(_dataToSend) === 'string') || (_dataToSend instanceof String) ) || (_dataToSend instanceof FormData) || (_dataToSend instanceof Blob)   )
		{
           data = _dataToSend;
		}
		else if( _dataToSend instanceof HTMLFormElement )
		{
			data = new FormData(_dataToSend);
		}
        else
		{
            data = new FormData();
            for (var name in _dataToSend) data.append( name, _dataToSend[ name ] );
		}
	}


	xhr.open(_sendMethod, _serviceUrl , true);

	if( _onBeforeSendCallback) _onBeforeSendCallback( xhr );

	xhr.send(data);
	
	return xhr;
}


function GetUrlVars( _url ) {
    _url = _url || window.location.href;
    var vars = {};
    var locationUrl = decodeURIComponent(_url);
    var parts = locationUrl.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        console.log('key: ' + key);
        console.log('value: ' + value );
        vars[key] = value;
    });
    return vars;
}




//function WriteTemplate ( _str )
//{
//	if(_str instanceof Function )
//	{
//		_str = _str.toString();
//		_str = _str.substring(_str.indexOf("/*")+2,_str.lastIndexOf("*/"));
//	}
//	console.log(_str);
//
//	var docFragment = document.createDocumentFragment();
//
//	var item = document.createElement('span');
//	item.innerHTML = _str;
//	docFragment.appendChild(item.firstElementChild);
//	document.currentScript.parentElement.replaceChild(docFragment,document.currentScript);
//
//	//for(var i=0; i<item.children; i++) docFragment.appendChild(item[i]);
//
//	//docFragment.innerHTML=_str;
//
//	//document.currentScript.parentElement.appendChild(docFragment);
//	//document.currentScript.parentElement.removeChild( document.currentScript );
//
//    //document.write(_str);
//    //document.currentScript.parentElement.removeChild( document.currentScript );
//}

function WriteTemplate ( _str )
{
	if(_str instanceof Function )
	{
		_str = _str.toString();
		_str = _str.substring(_str.indexOf("/*")+2,_str.lastIndexOf("*/"));
	}

	var template = document.createElement('span');
	template.innerHTML = _str;


	var scriptElement;


	if(document.currentScript)
	{
		scriptElement = document.currentScript;
	}
	else
	{
		var scripts = document.getElementsByTagName("script");
		scriptElement = scripts[scripts.length - 1];
	}


	var parentElement = scriptElement.parentElement;

	while(template.children.length)
	{
		parentElement.appendChild(template.children[0]);
		//console.log('template',template.children[0]);
	}
	parentElement.removeChild( scriptElement );
}

function IncludeTemplate ( _url )
{
    document.write('<script src="'+_url+'"><\/script>');
}


function IncludeCSS( _url )
{
	var head = document.getElementsByTagName('head')[0];
	var css=document.createElement("link");
	css.setAttribute("rel", "stylesheet");
	css.setAttribute("type", "text/css");
	css.setAttribute("href", _url);
	head.appendChild( css);
}



//function IncludeJS(url, callback)
//{
//	// Adding the script tag to the head as suggested before
//	var head = document.getElementsByTagName('head')[0];
//	var script = document.createElement('script');
//	script.type = 'text/javascript';
//	script.src = url;
//
//	// Then bind the event to the callback function.
//	// There are several events for cross browser compatibility.
//	script.onreadystatechange = script.onload = callback;
//
//	// Fire the loading
//	head.appendChild(script);
//	return script;
//}



function IncludeJS( _url , _onLoadScriptCallback )
{
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = _url;
	script.type = "text/javascript";

	if( (_onLoadScriptCallback != undefined) && (_onLoadScriptCallback != null) )
	{
		if (script.readyState){  //IE
			script.onreadystatechange = function(_e)
			{
				if (script.readyState == "loaded" || script.readyState == "complete")
				{
					script.onreadystatechange = null;
					_onLoadScriptCallback( script );
				}
			};
		} else {  //Others
			script.onload = function( _e ){
				script.loaded=true;
				_onLoadScriptCallback( script );
			};
		}
	}

	head.appendChild( script);
	return script;
}



//
//Function.prototype.extends = function ( _superClass )
//{
//	function inheritance() {}
//	inheritance.prototype = _superClass.prototype;
//	this.prototype = new inheritance();
//	this.prototype.constructor = this;
//	this.superConstructor = _superClass;
//	this.superClass = _superClass.prototype;
//};


function Extends(subClass, baseClass)
{
	function inheritance() {}
	inheritance.prototype = baseClass.prototype;
	subClass.prototype = new inheritance();
	subClass.prototype.constructor = subClass;
	subClass.superConstructor = baseClass;
	subClass.superClass = baseClass.prototype;
}


//* @author Kevin Lindsey
//function ExtendClass(subClass, baseClass)
//{
//   function inheritance() {}
//   inheritance.prototype = baseClass.prototype;
//   subClass.prototype = new inheritance();
//   subClass.prototype.constructor = subClass;
//   subClass.baseConstructor = baseClass;
//   subClass.superClass = baseClass.prototype;
//}



function BindFunction(scope, fn )
{
    if(!fn){
		console.log(errore);
    //console.log("Bind function is undefined" );
	//console.log("caller is " + arguments.callee.caller.toString());
	//console.log( scope );
    } 
    return function () { return fn.apply(scope, arguments); };
}
	
/*

If  _capturingPhase is true the event handler is set for the capturing phase, if is false the event handler is set for the bubbling phase.

               | |
---------------| |-----------------
| element1     | |                |
|   -----------| |-----------     |
|   |element2  \ /          |     |
|   -------------------------     |
|        Event CAPTURING          |
-----------------------------------

               / \
---------------| |-----------------
| element1     | |                |
|   -----------| |-----------     |
|   |element2  | |          |     |
|   -------------------------     |
|        Event BUBBLING           |
-----------------------------------


*/


	
function ConnectEvent ( _eventName , _elementList , _functionListener, _bindTarget ,_capturingPhase )
{          
	if(!_elementList)
	{
		console.warn('Can\'t connect the event:'+_eventName+' with the function',_functionListener);
		return;
	}

	if( ! (_elementList instanceof Array) && !(_elementList instanceof NodeList) ) _elementList = [ _elementList ];

	_functionListener =  _bindTarget ? BindFunction( _bindTarget, _functionListener ) : _functionListener;
	_capturingPhase = _capturingPhase || false;

    var element;
    var max=_elementList.length;

    for( var i=0; i<max; i++) {
        element=_elementList[i];
        if (element.addEventListener) {
            if (DEVICE_WITH_TOUCH_EVENTS) {
                // nel caso in cui arrivi uno di questi eventi converto in touch
                switch (_eventName) {
                    case "mousedown":
                        _eventName = "touchstart";
                        break;
                    case "mousemove":
                        _eventName = "touchmove";
                        break;
                    case "mouseup":
                        _eventName = "touchend";
                        break;
                }
            }
            element.addEventListener(_eventName, _functionListener, _capturingPhase);

        }
        else if (element.attachEvent) {
            element.attachEvent('on' + _eventName, _functionListener);
        }
        else {
            element['on' + _eventName] = _functionListener;
        }
    }
     
     return _functionListener;
}



function DisconnectEvent ( _eventName , _elementList , _functionListener, _capturingPhase )
{
    if( ! (_elementList.length) ) _elementList = [ _elementList ];
    var element;
    var max = _elementList.length;

    for (var i = 0; i < max; i++) {
        element=_elementList[i];
        if (element.removeEventListener) {
            if (DEVICE_WITH_TOUCH_EVENTS) {
                // nel caso in cui arrivi uno di questi eventi converto in touch
                switch (_eventName) {
                    case "mousedown":
                        _eventName = "touchstart";
                        break;
                    case "mousemove":
                        _eventName = "touchmove";
                        break;
                    case "mouseup":
                        _eventName = "touchend";
                        break;
                }
            }
            element.removeEventListener(_eventName, _functionListener, _capturingPhase);
        }
        else if (element.attachEvent) {
            element.detachEvent('on' + _eventName, _functionListener);
        }
        else {
            element['on' + _eventName] = null;
        }
    }
}








// Utils


/* ARRAY UTILS */

Array.prototype.clone = function() { return this.slice(0); }

Array.prototype.add = Array.prototype.push;

Array.prototype.addAt = function( _item , _id )
{
	this.splice( _id, 0, _item);
}

Array.prototype.replaceAt = function( _item , _id  )
{
	var removedItem = this[_id];
	this.splice( _id, 1, _item);
	return removedItem;
}

Array.prototype.remove = function( _item )
{
	var index = this.indexOf(_item);
	if(index>-1) this.splice(index, 1);
}

Array.prototype.removeAt = function( _id )
{
	var removedItem = this[_id];
	this.splice(_id, 1);
	return removedItem;
}



Node.prototype.remove = function()
{
	this.parentNode.removeChild( this );
};

Node.prototype.removeChildren = function ()
{
	var myNode = this;
	while (myNode.firstChild){  myNode.removeChild(myNode.firstChild); }
};


Node.prototype.cloneChildrenTo = function( _elementTarget )
{
	var id, max = this.children.length;
	for(  id = 0; id<max ; id++) _elementTarget.appendChild( this.children[id].cloneNode(true) );
};


Node.prototype.appendChildren = function( _elementList )
{
	var max = _elementList.length;
	for( var id = 0; id<max ; id++) this.appendChild( _elementList[id] );
};

Node.prototype.setIndex = function ( new_id )
{
	var child_id = this.getIndex();

	if( (child_id<0) || (new_id<0) || (new_id == child_id) || (new_id > this.parentNode.childNodes.length-1) ) return;

	var nodeList = [].slice.call(this.parentNode.childNodes, 0);
	nodeList.splice( child_id, 1 );
	nodeList.splice( new_id, 0, this );

	var max = nodeList.length;
	for(var i=0; i<max; i++)
	{
		this.parentNode.appendChild( nodeList[i] );
	}
};


Node.prototype.bringToFront = function()
{
	this.parentNode.appendChild( this  );
};

Node.prototype.sendToBack = function()
{
	this.parentNode.insertBefore( this , this.parentNode.childNodes[0] );
};

Node.prototype.bringUp = function()
{
	if(!this.nextElementSibling)return;
	this.setIndex( this.nextElementSibling.getIndex() );
};

Node.prototype.sendDown = function()
{
	if(!this.previousElementSibling)return;
	this.setIndex( this.previousElementSibling.getIndex() );
};

Node.prototype.getIndex = function ()
{
	var node = this;
	var i = 0;
	while ( node = node.previousSibling) { ++i ; }
	return i;
};

NodeList.prototype.indexOf = function (_node)
{
	var i = 0;
	while (_node = _node.previousSibling) { if (_node.nodeType === 1)++i ; }
	return i;
};



Element.prototype.setCursorClass = function ( _cursorClass )
{
	if(!this.classList) return;


	if(DEVICE_WITH_TOUCH_EVENTS)return;
	if(this.cursorClass==_cursorClass)return;

	if(this.cursorClass)this.classList.remove(this.cursorClass);
	this.classList.add(_cursorClass);
	this.cursorClass=_cursorClass;
};




Element.prototype.getGlobalPosition = function()
{
	var element = this;
	var xPosition = 0;
	var yPosition = 0;

	while (element) {
		xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
		yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
		element = element.offsetParent;
	}
	return { x: xPosition, y: yPosition };
};



Element.prototype.globalToLocal = function ( _point )
{
	var globalElementPos = this.getGlobalPosition();
	return {x:_point.x-globalElementPos.x, y:_point.y-globalElementPos.y};
};


Element.prototype.getPosition = function  ()
{
	return {x:this.offsetLeft,y:this.offsetTop};
};

Element.prototype.setPosition = function  ( _x , _y , _unit )
{
	_unit = _unit || 'px';
	this.style.left = _x + _unit;
	this.style.top = _y + _unit;
};

Element.prototype.setPositionX = function  ( _x  , _unit )
{
	_unit = _unit || 'px';
	this.style.left = _x + _unit;
};

Element.prototype.setPositionY = function  ( _y , _unit )
{
	_unit = _unit || 'px';
	this.style.top = _y + _unit;
};


Element.prototype.getSize = function  ()
{
	return {x:this.offsetWidth,y:this.offsetHeight};
}


Element.prototype.setSize = function  ( _x , _y , _unit )
{
	_unit = _unit || 'px';
	this.style.width = _x+ _unit;
	this.style.height = _y+ _unit;
};

Element.prototype.setSizeX = function  ( _x , _unit )
{
	_unit = _unit || 'px';
	this.style.width = _x+ _unit;
};


Element.prototype.setSizeY = function  (  _y , _unit )
{
	_unit = _unit || 'px';
	this.style.height = _y+ _unit;
};



Element.prototype.setTransform = function  ( value, origin)
{
	el.style.Transform = value;
	el.style.MozTransform = value;
	el.style.msTransform = value;
	el.style.OTransform = value;
	el.style.webkitTransform = value;

	if(origin==undefined)return;
	el.style.TransformOrigin = origin;
	el.style.MozTransformOrigin = origin;
	el.style.msTransformOrigin = origin;
	el.style.OTransformOrigin = origin;
	el.style.webkitTransformOrigin = origin;
};


function PathInfo ( _filePath )
{
	var splittedPath = _filePath.split('/');
	var fileName = splittedPath[ splittedPath.length-1 ];
	var dir = '';
	if(splittedPath.length>1){
		splittedPath.pop();
		dir = splittedPath.join('/');
	}
	var splittedName = fileName.split('.');
	var fileNameNoExtension = '';
	var fileExtension = '';
	if(splittedName.length>1){
		fileExtension = splittedName.pop();
		fileNameNoExtension = splittedName.join('.');
	}
	return { dir:dir ,  fileName:fileName , fileNameNoExtension:fileNameNoExtension , fileExtension:fileExtension };
}

ConnectEvent (  "keydown" ,window , function(_e){if(_e.keyCode==32)Event.spaceKey=true;}  , null, true  );
ConnectEvent (  "keyup" , window , function(_e){if(_e.keyCode==32)Event.spaceKey=false;} , null, true  );




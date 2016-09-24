//TBD ---paint bucket tool, bg change option, shadowing tool, text tool, undo tool
//material design tools, UI design tools, size of canvas, chat tool, notes tool,
// save canvas, db tools
paper.install(window);
	// Keep global references to both tools, so the HTML
	// links below can access them.
	var tBrush,tLine,tRect,tCircle,tErase,tPolygon,tText,tmBox,tmCircle;
	var text,polyPath;
	var path,rect,circle;
	var history=[];
	var io;
	window.onload = function() {
		paper.setup('drawing');
		var bgColor;
		paper.project.currentStyle = {
			strokeColor: '#000000',
			fillColor: null,
			strokeWidth: 10,
			strokeCap :'round',
			strokeJoin : 'round'
		};

		io = io.connect('/');
		io.on( 'canvas_change', function( data) {  
			  drawJSON(data);  
			});

		$('#stroke_color').colorpicker().on('changeColor', function(ev){
				paper.project.currentStyle.strokeColor = ev.color.toHex();
				paper.project.currentStyle.strokeColor.alpha=ev.color.toRGB().a;	
			}
		);
		$('#fill_color').colorpicker().on('changeColor', function(ev){
				paper.project.currentStyle.fillColor = ev.color.toHex();
				paper.project.currentStyle.fillColor.alpha=ev.color.toRGB().a;
			}
		);
		$('#bg_color').colorpicker().on('changeColor', function(ev){
				bgColor = ev.color.toHex();
				$('body').css("background-color",bgColor);
			}
		);
		
		//polyPath= new Path();
		function onMouseDown(event) {
			path = new Path();
			//path.strokeColor = 'black';
			path.add(event.point);
		}

		tBrush = new Tool();
		tLine = new Tool();
		tRect = new Tool();
		tCircle = new Tool();
		tErase = new Tool();
		tPolygon= new Tool();
		tText= new Tool();
		tmBox= new Tool();
		tmCircle= new Tool();

		tBrush.onMouseDown = onMouseDown;
		tBrush.onMouseDrag = function(event) {
			path.fillColor=null;
			path.add(event.point);
		}

		tErase.onMouseDown = onMouseDown;
		tErase.onMouseDrag = function(event) {
			path.strokeColor=bgColor;
			path.strokeWidth=20;
			path.fillColor=null;
			path.add(event.point);
		}

		tErase.onMouseUp=function(event){
			var ser = path.exportJSON();
			io.emit("canvas_change",ser);
		}

		tBrush.onMouseUp=function(event){
			var ser = path.exportJSON();
			io.emit("canvas_change",ser);
		}

		
		//tLine.minDistance = 20;
		tLine.onMouseDown = onMouseDown;
		tLine.onMouseUp = function(event) {
			path.add(event.point);
			var ser = path.exportJSON();
			io.emit("canvas_change",ser);
		}

		tRect.onMouseUp=function(event){
			rect = new Path.Rectangle(
			event.downPoint,
			event.point);
			//rect.strokeColor = 'black';
			history[0]=rect;
			var ser = rect.exportJSON();
			io.emit("canvas_change",ser);
		}

		tCircle.onMouseUp=function(event){
			circle = new Path.Circle({
			center: event.middlePoint,
			radius: event.delta.length / 2});
			history[0]=circle;
			var ser = circle.exportJSON();
			io.emit("canvas_change",ser);
		}

		tPolygon.onMouseDown=function(event){
			// Add a segment to the path at the position of the mouse:
			polyPath.add(event.point);
			var ser = polyPath.exportJSON();
			io.emit("canvas_change",ser);
		}
		
		tText.onMouseDown=function(event) {
			text = new PointText({
				point: event.point,
				content: ' ',
				justification: 'center',
				fontSize: 30				
			});
		}
		tText.onKeyDown=function(event) {
			// When a key is pressed, set the content of the text item:
			text.content += event.key;
		}
		tmCircle.onMouseUp=function(event){
			rect = new Path.Circle({
			center: event.middlePoint,
			radius: event.delta.length / 2});
			rect.fillColor = paper.project.currentStyle.fillColor;
			rect.strokeJoin="round";
			rect.shadowColor= new Color(0, 0, 0);
    	    rect.shadowBlur= 15;
    	    rect.shadowOffset= new Point(5, 5);
			rect.strokeColor = rect.fillColor;
			history[0]=rect;
			var ser = rect.exportJSON();
			io.emit("canvas_change",ser);
		}	

		tmBox.onMouseUp=function(event){
			rect = new Path.Rectangle(
			event.downPoint,
			event.point);
			rect.fillColor = paper.project.currentStyle.fillColor;
			rect.shadowColor= new Color(0, 0, 0);
    	    rect.shadowBlur= 12;
    	    rect.shadowOffset= new Point(5, 5);
			rect.strokeJoin="round";
			rect.strokeColor = rect.fillColor;
			var ser = rect.exportJSON();
			console.log(ser);
			history[0]=rect;
			io.emit("canvas_change",ser);
		}
	}

	function setStrokeWidth(e){
		paper.project.currentStyle.strokeWidth=e;
	}

	function setCorner(){
		if($('#corner_type').is(":checked"))
		{
			paper.project.currentStyle.strokeCap="round";
			paper.project.currentStyle.strokeJoin="round";
			$('#corner_type').checked="unchecked";
		}
		else{
			paper.project.currentStyle.strokeCap="square";
			paper.project.currentStyle.strokeJoin="miter";
		}
	}

	tPolygon_activate=function(){
		tPolygon.activate();
		polyPath= new Path();
	}

	undo=function () {
		history[0].remove();
		paper.view.update();
	}

// Draw functions for all tools
//rect, circle,	line, polygon, mBox, mCircle

drawJSON=function(json){
	var path =new Path();
	path.importJSON(json);
	paper.view.update();
}
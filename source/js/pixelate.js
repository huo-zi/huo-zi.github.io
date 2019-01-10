var Pixelate = function(imgDom){
	this.data = [];
	this.img = imgDom;
	this.size = 64;
	this.min = 2;
	this.num = 4;
	this.developer = true;
	this.canClean = false;
	this.loadSvg();
}

Pixelate.prototype = {
	constructor : Pixelate,

	loadSvg: function(){
		this.rate = this.img.width / this.img.naturalWidth;
		this.width = this.img.width;
		this.height = this.img.height;
		this.src = this.img.src;
		this.tags = [];

		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('width', this.width);
		this.svg.setAttribute('height', this.height);
		this.svg.innerHTML = '<image xlink:href="'+this.src+'" width="'+this.width+'" height="'+this.height+'" />';
		if(this.developer){
			var self = this;
			this.svg.onclick = function(e){
				if(e.target.tagName != 'image'){
					return false;
				}
				var rec = self.loadRect(e.offsetX, e.offsetY, self.size * self.rate, self.size * self.rate);
				self.split(rec, self.num);
				self.tags.push(e.offsetX + ',' + e.offsetY);
			}
		}
		if(this.src.lastIndexOf('#') != -1){
			var tags = this.src.substr(this.src.lastIndexOf('#') + 1);
			if(tags.indexOf(',') != -1){
				this.tags = tags.split('|');
			}
		}
		
		var cav = document.createElement('canvas');
			cav.setAttribute('width', this.width);
			cav.setAttribute('height', this.height);
		var ctt = cav.getContext('2d');
			ctt.drawImage(this.img, 0, 0, this.width, this.height);
		this.data = ctt.getImageData(0, 0, this.width, this.height).data;
		this.img.parentNode.replaceChild(this.svg, this.img);
	},

	loadPixelate: function(){
		this.svg.childNodes.lenght = 1;
		for(var i = 0; i < this.tags.length; i++){
			var tag = this.tags[i].split(',');
			var rec = this.loadRect(tag[0] * this.rate, tag[1] * this.rate, this.size * this.rate, this.size * this.rate);
			this.split(rec, this.num);
		}
	},

	loadRect: function(rx, ry, rw, rh){
		var cx = parseFloat(rx) - rw / 2;
		var cy = parseFloat(ry) - rh / 2;
		var ci = (this.width * parseInt(ry) + parseInt(rx)) * 4;
		var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			rect.setAttribute('x', cx);
			rect.setAttribute('y', cy);
			rect.setAttribute('width', rw);
			rect.setAttribute('height', rh);
			rect.setAttribute('style', 'fill:rgb(' + this.data[ci] + ','+this.data[ci+1] + ',' + this.data[ci+2] + ')');
		return rect;
	},

	split: function(parent, num = 2){
		var self = this;
		var px = parent.getAttribute('x');
		var py = parent.getAttribute('y');
		var rw = parent.getAttribute('width') / num;
		var rh = parent.getAttribute('height')/ num;
		if(rw <= this.min || rh <= this.min){
			return false;
		}
		for(var x = 0; x < num; x++){
			for(var y = 0; y < num; y++){
				var rx = parseFloat(px) + rw * (x + 0.5);
				var ry = parseFloat(py) + rh * (y + 0.5);
				var rect = this.loadRect(rx, ry, rw, rh);
				rect.onmouseover = function(){
					if(self.canClean){
						self.svg.removeChild(this);
						self.split(this);
					}
				}
				this.svg.appendChild(rect);
			}
		}
	},

	build: function(){
		if(this.src.indexOf('#') != -1){
			this.src = this.src.substring(0, this.src.lastIndexOf('#'));
		}
		if(this.tags.length > 0){
			this.src += '#' + this.tags.join('|');
		}
		return this.src;
	}
}

HTMLImageElement.prototype.pixelate = function(){
	return new Pixelate(this);
}



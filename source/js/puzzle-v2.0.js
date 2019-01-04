function Puzzle(divId, width, height, src, className){
	this.divId = divId;
	this.width = width;
	this.height = height;
	this.src = src;
	this.className = className;
	this.initialImg = document.getElementById(this.divId);
	this.initialDiv = [];
	this.initialId  = [];
	this.around = [];
	this.selectId = null;
	this.timer = null;
}
  
Puzzle.prototype = {
	constructor : Puzzle,
	
	loadPuzzle : function(){
		var self = this;
		var puDiv = document.createElement('div');
			puDiv.id = self.divId;
			puDiv.alt = self.src;
			puDiv.className = self.className;
			puDiv.style.width  = self.width+'px';
			puDiv.style.height = self.height+'px';
			
		var rows, cols, size, w, h;
		size = self.switchSize();
		rows = parseInt(self.width/size) + 1;
		cols = parseInt(self.height/size) + 1;
		
		w = parseInt((self.width -rows*2)/rows);
		h = parseInt((self.height-cols*2)/cols);

		for(var i = 0; i < rows*cols; i++){
			var x,y;

			x = -parseInt(i%rows)*(w+1)-1*parseInt(i%rows)-1;
			y = -parseInt(i/rows)*(h+1)-1*parseInt(i/rows)-1;

			var divPic = document.createElement('div');
			divPic.id = self.divId+'_'+i;
			divPic.style.width = w+'px';
			divPic.style.height = h+'px';
			divPic.style.margin = '1px';

			divPic.style.backgroundImage = 'url('+self.src+')';
			divPic.style.backgroundSize = self.width+'px '+self.height+'px';
			divPic.style.backgroundPosition = x+'px '+y+'px';
			divPic.style.float = 'left';
			divPic.style.cssFloat = 'left';
			divPic.style.overflow = 'hidden'; 
			divPic.style.cursor = 'pointer'; 

			//divPic.innerText = divPic.id;
			divPic.draggable = 'true';
			divPic.onclick = function(){
				self.clearFlash();
				if(self.selectId != null){
					document.getElementById(self.selectId).className = '';
					for(var i = 0; i < self.around.length; i++){
						if(self.around[i].id == this.id){
							var bggd = this.style.backgroundPosition;
							var Domd = document.getElementById(self.selectId);
							this.style.backgroundPosition = Domd.style.backgroundPosition;
							Domd.style.backgroundPosition = bggd;
							Domd.id = this.id;
							this.id = self.selectId;
							self.checkSuccess();
							self.selectId = null;return false;
						}
					}
				}
				this.className = 'puzzle_over';
				self.selectId = this.id;
				var index = -1;
				for(var i = 0; i < rows*cols; i++){
					if(this.parentNode.childNodes[i].id == this.id){
						index = i;
					}
				}
				var top = index < rows ? -1 : index-rows;
				var btm = index >(rows-1)*cols ? -1 : index+rows;
				var lft = index % rows ? index-1 : -1;
				var rit = index % rows == (rows-1) ? -1 : index+1; 
				//alert([top,btm,lft,rit]);
				self.around = [];
				for(var index = 0; index < rows*cols; index++){
					if(index == top || index == btm || index == lft || index == rit){
						self.around.push(this.parentNode.childNodes[index]);
					}
				}
				self.flash();
			};

			divPic.ondblclick = function(){if(confirm('确认放弃吗???'))self.regain();};

			self.initialDiv[i] = divPic;
			self.initialId[i]  = divPic.id;
		}
		
		for(var j = 0; j < rows*cols; j++){
			var index = parseInt(Math.random() * self.initialDiv.length);
			puDiv.appendChild(self.initialDiv[index]);
			self.initialDiv.splice(index,1);
		}
		puDiv.onclick = function(){return false;};
		self.initialImg.parentNode.replaceChild(puDiv, self.initialImg);
	},
	//检索是否拼图完成
	checkSuccess : function(){
		var ids = document.getElementById(this.divId).getElementsByTagName('div');
		for(var i = 0; i < ids.length; i++){
			if(this.initialId[i] != ids[i].id){
				return false;
			}
		}
		this.regain();
	},
	
	regain : function(){
		var puDiv = document.getElementById(this.divId);
		puDiv.parentNode.replaceChild(this.initialImg, puDiv);
	},
	
	flash : function(){
		var weight = 1;
		var self = this;
		this.timer = setInterval(function(){
			weight = weight+1;
			weight = weight>7 ? 1 : weight;
			for(var i = 0; i < self.around.length; i++){
				self.around[i].style.opacity = '0.'+weight;
			}
		},100);
	},
	
	clearFlash : function(){
		for(var i = 0; i < this.around.length; i++){
			this.around[i].style.opacity = null;
		}
		clearInterval(this.timer);
	},
	
	switchSize : function(){
		var size = (this.width < this.height) ? this.width : this.height; 
		if(size <= 100){
			return 40;
		}else if(size > 100 && size <= 200){
			return 50;
		}else if(size > 200 && size <= 300){
			return 80;
		}else if(size > 300 && size <= 400){
			return 100;
		}else{
			return parseInt(size/4);
		}
	}
};

onload = function(){
	var puzzle_style =  document.createElement('style');
	puzzle_style.type = 'text/css';
	puzzle_style.innerHTML = '.puzzle_over{background:#FF0000;filter:alpha(opacity=50);-moz-opacity:0.5;opacity: 0.3;}.puzzle_overline{background:#FFF;filter:alpha(opacity=50);-moz-opacity:0.5;opacity: 0.5;}'; 
	document.head.appendChild(puzzle_style);

	var Domimgs = document.getElementsByTagName('img');
	for(var index = 0; index < Domimgs.length; index++){
		if(Domimgs[index].width > 100 && Domimgs[index].height > 80){
			var image = Domimgs[index];
			if(image.id == '' || image.id == undefined){
				image.id = 'Puzzle_div_'+index;
			}

			image.ondblclick = function(){
				new Puzzle(this.id, this.width, this.height, this.src, this.className).loadPuzzle();
			};
			image.onclick = function(){return false;};
		}
	}
};
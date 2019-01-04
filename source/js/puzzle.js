//////////////////
//拼图插件V3.0
//编码:UTF-8
//火子
//2014-05-20
/////////////
function Puzzle(divId, img){
	this.divId = divId;
	this.width = img.width;
	this.height = img.height;
	this.src = img.src;
	this.className = img.className;
	this.initialImg = img;
	this.initialDiv = [];
	this.initialId  = [];
	this.emptyIndex = 0;
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
			puDiv.style.display = 'inline-block';
			puDiv.style.position = 'relative';
			
		var rows, cols, size, w, h;
		size = self.switchSize();
		rows = Math.ceil(self.width/size);
		cols = Math.ceil(self.height/size);
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

			divPic.style.backgroundPosition = x+'px '+y+'px';
			divPic.style.backgroundSize = self.width+'px '+self.height+'px';
			divPic.style.backgroundImage = (i == rows*cols-1) ? '' : 'url('+self.src+')';
			divPic.style.float = 'left';
			divPic.style.cssFloat = 'left';
			divPic.style.overflow = 'hidden'; 
			divPic.style.cursor = 'pointer';
			
			//divPic.innerText = divPic.id;
			divPic.onclick = function(){
				var index = 0;
				for(var i = 0; i < rows*cols; i++){
					if(this.parentNode.childNodes[i].id == this.id){
						index = i;break;
					}
				}
				if(index == self.emptyIndex){
					return false;
//				}else if(parseInt(index/rows) == parseInt(self.emptyIndex/rows) || index%rows == self.emptyIndex%rows){
				}else if(index == self.emptyIndex+rows || index == self.emptyIndex-rows||(parseInt(index/rows) == parseInt(self.emptyIndex/rows) && Math.abs(index-self.emptyIndex) == 1)){
					var m = (index%rows == self.emptyIndex%rows) ? rows : 1;
					var n = index > self.emptyIndex ? -1 : 1;
					var doms = this.parentNode.childNodes[index];
					var empty= this.parentNode.childNodes[index + m*n];
					var dimg = doms.style.backgroundImage;
					var dmId = doms.id;
					var clon = doms.cloneNode();
					doms.style.backgroundImage = '';
					doms.id = empty.id;
					clon.style.position = 'absolute';
					clon.zIndex = '9999';
					clon.style.left = (parseInt(i%rows)*(w+1)+1*parseInt(i%rows))+'px';
					clon.style.top  = (parseInt(i/rows)*(h+1)+1*parseInt(i/rows))+'px';
					puDiv.appendChild(clon);
					var offset=(m!=1)?clon.offsetTop:clon.offsetLeft, i=1, length=h;
					var timer = setInterval(function(){
						(m!=1)?clon.style.top = (offset+1*i*n)+'px':clon.style.left = (offset+1*i*n)+'px';
						if(i>length){
							clearTimeout(timer);
							puDiv.removeChild(clon);
							empty.style.backgroundImage = dimg;
							empty.style.backgroundPosition = doms.style.backgroundPosition;
							empty.id = dmId;
							self.checkSuccess();
						}
						i=i+2;
					},1);
					self.emptyIndex = index;
				}
			};
			divPic.ondblclick = function(){if(confirm('Give Up???'))self.regain();};
								
			self.initialDiv[i] = divPic;
			self.initialId[i]  = divPic.id;
		}
		
		for(var i = 0; i < rows*cols; i++){
			var index = parseInt(Math.random() * self.initialDiv.length);
			if(!self.initialDiv[index].style.backgroundImage){
				self.emptyIndex = i;
			}
			puDiv.appendChild(self.initialDiv[index]);
			self.initialDiv.splice(index,1);
		}
		puDiv.onclick = function(){return false;};
		self.initialImg.parentNode.replaceChild(puDiv, self.initialImg);
	},
	//检索是否拼图完成
	checkSuccess : function(){
		var ids = document.getElementById(this.divId).getElementsByTagName('div');
		for(var k = 0; k < ids.length; k++){
			if(this.initialId[k] != ids[k].id){
				return false;
			}
		}
		this.regain();
	},
	
	findMover : function(){
		
	},
	
	move:function(dom,path,length){
		var positions,pixel,i = 1;
		switch(path){
			case 'left':
				positions = 'left';pixel = -1;break;
			case 'right':
				positions = 'left';pixel = 1;break;
			case 'top':
				positions = 'top';pixel = -1;break;
			case 'bottom':
				positions = 'top';pixel = 1;break;
		}
		var top = dom.offsetTop;
		var timer = setInterval(function(){
			if(positions == 'top'){
				dom.style.top = (top+pixel*i)+'px';
			}else{
				dom.style.left = (top+pixel*i)+'px';
			}
			if(i>length){clearTimeout(timer);dom.parentNode.removeChild(dom);}
			i=i+2;
		},1);
	},
	
	regain : function(){
		var puDiv = document.getElementById(this.divId);
		puDiv.parentNode.replaceChild(this.initialImg, puDiv);
	},
	
	switchSize : function(){
		var size = (this.width < this.height) ? this.width : this.height; 
		if(size <= 100){
			return 40;
		}else if(size > 100 && size <= 200){
			return 80;
		}else if(size > 200 && size <= 300){
			return 100;
		}else if(size > 300 && size <= 400){
			return 150;
		}else{
			return parseInt(size/3);
		}
	}
};

onload = function(){
	var puzzle_style =  document.createElement('style');
	puzzle_style.type = 'text/css';
//	puzzle_style.innerHTML = ''; 
//	document.head.appendChild(puzzle_style);

	var Domimgs = document.getElementsByTagName('img');
	for(var index = 0; index < Domimgs.length; index++){
		if(Domimgs[index].width > 100 && Domimgs[index].height > 80 && Domimgs[index].className.indexOf('puzzle') != -1){
			var image = Domimgs[index];
			if(image.id == '' || image.id == undefined){
				image.id = 'Puzzle_div_'+index;
			}

			image.ondblclick = function(){
				new Puzzle(this.id, this).loadPuzzle();
			};
			image.onclick = function(){return false;};
		}
	}
};
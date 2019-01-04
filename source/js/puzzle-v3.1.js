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
	this.rows = 0;
	this.cols = 0;
	this.m = .5;
	this.p = 2;
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
			
		var size,count, w, h;
		size = self.switchSize();
		this.rows = Math.ceil(self.width/size);
		this.cols = Math.ceil(self.height/size);
		count = this.rows * this.cols;
		w = parseInt(self.width/this.rows - 2);
		h = parseInt(self.height/this.cols - 2);

		for(var i = 0; i < count; i++){
			var x = -parseInt(i%this.rows)*(w+this.m*2)-1;
			var y = -parseInt(i/this.rows)*(h+this.m*2)-1;

			var divPic = document.createElement('div');
			divPic.id = self.divId+'_'+i;
			divPic.style.width = w+'px';
			divPic.style.height = h+'px';
			divPic.style.margin = this.m+'px';

			divPic.style.float = 'left';
			divPic.style.cssFloat = 'left';
			divPic.style.overflow = 'hidden';
			if(i != count - 1){
				divPic.style.backgroundImage = 'url('+self.src+')';
				divPic.style.backgroundPosition = x+'px '+y+'px';
			}
			// 
			divPic.onclick = function(){self.move(this);};
			divPic.ondblclick = function(){if(confirm('Give Up???'))self.regain();};
								
			self.initialDiv[i] = divPic;
			self.initialId[i]  = divPic.id;
		}
		
		var array = self.rand(count);
		
		for(i in array){
			var index = array[i];
			if(!self.initialDiv[index].style.backgroundImage){
				self.emptyIndex = parseInt(i);
			}
			puDiv.appendChild(self.initialDiv[index]);
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
	
	move:function(dom, length){
		var	nodes = dom.parentNode.childNodes;
		var index = -1;
		for(var i in nodes){
			if(nodes[i] == dom){
				index = i;
			}
		}
		if(this.emptyIndex == index){
			return false;
		}

		//同列相邻或同行相邻
		if(Math.abs(this.emptyIndex - index) == this.rows || (parseInt(index/this.rows) == parseInt(this.emptyIndex/this.rows) && Math.abs(this.emptyIndex - index) == 1)){
			var pixel = (this.emptyIndex - index > 0) ? 1 : -1;							//判断正负向移动
			var positions = Math.abs(this.emptyIndex - index) == 1 ? 'left' : 'top';	//判断横纵向移动
			var clon = dom.cloneNode();
			var empty = nodes[this.emptyIndex];
			clon.style.position = 'absolute';
			clon.zIndex = '9999';
			clon.style.margin = 0;
			clon.style.left = dom.offsetLeft + 'px';
			clon.style.top = dom.offsetTop + 'px';
			dom.id = empty.id;
			dom.style.backgroundImage = null;
			dom.parentNode.appendChild(clon);
			this.emptyIndex = index;
			var i = 0;
			var offset = positions == 'top' ? clon.offsetTop : clon.offsetLeft;
			var self = this;
			var timer = setInterval(function(){
				if(positions == 'top'){
					clon.style.top = (offset + pixel*i) + 'px';
				}else{
					clon.style.left = (offset + pixel*i) + 'px';
				}
				if((positions == 'left' && i > clon.offsetWidth) || (positions == 'top' && i > clon.offsetHeight)){
					clearTimeout(timer);
					empty.style.backgroundImage = clon.style.backgroundImage;
					empty.style.backgroundPosition = clon.style.backgroundPosition;
					empty.id = clon.id;
					dom.parentNode.removeChild(clon);
					self.checkSuccess();
				}
				i = i + self.p;
			},1);
		}
		return true;
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
	},
	
	rand : function(num){
		num = parseInt(num);
		var r;
		do{
			r = []; 
			var a = [];
			var i = 0,o = 0;
			while(i < num - 1){
			    var t = parseInt(Math.random()*(num - 1));
			    if(a[t] == undefined){
			        a[t] = true;
			        r.push(t);
			        i++;
			    }
			}
			for(var i = 0; i < r.length - 1; i++){
				for(var j = i+1; j < r.length; j++){
					if(r[i] > r[j]){
						o++;
					}
				}
			}
			if(o%2 == 0)break;
		}while(true);
		r.push(num - 1);
		return r;
	},
	
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
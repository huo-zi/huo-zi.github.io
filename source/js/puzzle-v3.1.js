//////////////////
//拼图插件V3.0
//编码:UTF-8
//火子
//2014-05-20
/////////////
function Puzzle(img){
	this.initialImg = img;
	this.rows = 3;
	this.cols = 3;
	this.margin = .5;
	this.speed = 2;
}

Puzzle.prototype = {
	constructor : Puzzle,
	
	loadPuzzle : function(option = {}){
		var self = this;
		var width = this.initialImg.width;
		var height = this.initialImg.height;
		var divId = 'puzzel_' + parseInt(Math.random() * 100);
		var puDiv = document.createElement('div');
			puDiv.id = divId;
			puDiv.className = this.initialImg.className;
			puDiv.style.width  = width+'px';
			puDiv.style.height = height+'px';
			puDiv.style.display = 'inline-block';
			puDiv.style.position = 'relative';

		this.div = puDiv;
		this.rows = option.rows || this.rows;
		this.cols = option.cols || this.cols;
		this.margin = option.margin || this.margin;
		this.speed = option.speed || this.speed;
		this.initialDiv = [];
		this.initialId = [];
		var count = this.rows * this.cols;
		var w = parseInt(width / this.rows - this.margin * 2);
		var h = parseInt(height / this.cols - this.margin * 2);

		for(var i = 0; i < count; i++){
			var x = -parseInt(i % this.rows) * (w + this.margin * 2) - 1;
			var y = -parseInt(i / this.rows) * (h + this.margin * 2) - 1;

			var divPic = document.createElement('div');
			divPic.id = divId + i;
			divPic.style.width = w+'px';
			divPic.style.height = h+'px';
			divPic.style.margin = this.margin+'px';

			divPic.style.float = 'left';
			divPic.style.cssFloat = 'left';
			divPic.style.overflow = 'hidden';
			if(i != count - 1){
				divPic.style.backgroundImage = 'url('+this.initialImg.src+')';
				divPic.style.backgroundPosition = x+'px '+y+'px';
			}

			divPic.onclick = function(){self.move(this);};
			divPic.ondblclick = function(){if(confirm('Give Up???'))self.regain();};
								
			this.initialDiv[i] = divPic;
			this.initialId[i]  = divPic.id;
		}

		var array = this.rand(count);
		for(i in array){
			var index = array[i];
			if(!this.initialDiv[index].style.backgroundImage){
				this.emptyIndex = parseInt(i);
			}
			puDiv.appendChild(this.initialDiv[index]);
		}

		puDiv.onclick = function(){return false;};
		this.initialImg.parentNode.replaceChild(puDiv, this.initialImg);
	},
	//检索是否拼图完成
	checkSuccess : function(){
		var ids = this.div.getElementsByTagName('div');
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
			clon.zIndex = '9999';
			clon.style.margin = 0;
			clon.style.position = 'absolute';
			clon.style.left = dom.offsetLeft + 'px';
			clon.style.top = dom.offsetTop + 'px';
			dom.id = empty.id;
			dom.style.backgroundImage = null;
			dom.parentNode.appendChild(clon);
			this.emptyIndex = index;
			var i = 0;
			var offset = (positions == 'top') ? clon.offsetTop : clon.offsetLeft;
			var self = this;
			var timer = setInterval(function(){
				clon.style[positions] = (offset + pixel * i) + 'px'
				if((positions == 'left' && i > clon.offsetWidth) || (positions == 'top' && i > clon.offsetHeight)){
					clearTimeout(timer);
					empty.style.backgroundImage = clon.style.backgroundImage;
					empty.style.backgroundPosition = clon.style.backgroundPosition;
					empty.id = clon.id;
					dom.parentNode.removeChild(clon);
					self.checkSuccess();
				}
				i = i + self.speed;
			}, 1);
		}
		return true;
	},
	
	regain : function(){
		this.div.parentNode.replaceChild(this.initialImg, this.div);
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

window.addEventListener('load', function(){
	var Domimgs = document.getElementsByTagName('img');
	for(var index = 0; index < Domimgs.length; index++){
		if(Domimgs[index].width > 100 && Domimgs[index].height > 80 && Domimgs[index].className.indexOf('puzzle') != -1){
			var image = Domimgs[index];
			image.ondblclick = function(){
				new Puzzle(this).loadPuzzle();
			};
			image.onclick = function(){return false;};
		}
	}
});

HTMLImageElement.prototype.puzzle = function(){
	return new Puzzle(this);
}
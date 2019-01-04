//////////////////
//拼图插件V3.0
//编码:UTF-8
//火子
//2014-05-20
/////////////
function Puzzle(divId, width, height, src, className){
	this.divId = divId;
	this.width = width;
	this.height = height;
	this.src = src;
	this.className = className;
	this.initialImg = document.getElementById(this.divId);
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
				}else if(parseInt(index/rows) == parseInt(self.emptyIndex/rows) || index%rows == self.emptyIndex%rows){
//				}else if(index == self.emptyIndex+rows || index == self.emptyIndex-rows||(parseInt(index/rows) == parseInt(self.emptyIndex/rows) && Math.abs(index-self.emptyIndex) == 1)){
					var m = (index%rows == self.emptyIndex%rows) ? rows : 1;
					if(index > self.emptyIndex){
						for(var j = self.emptyIndex; j < index ; j=j+m){
							var domBg = this.parentNode.childNodes[j].style.backgroundImage;
							var domBp = this.parentNode.childNodes[j].style.backgroundPosition;
							var domId = this.parentNode.childNodes[j].id;
							this.parentNode.childNodes[j].style.backgroundImage = this.parentNode.childNodes[j+m].style.backgroundImage;
							this.parentNode.childNodes[j].style.backgroundPosition = this.parentNode.childNodes[j+m].style.backgroundPosition;
							this.parentNode.childNodes[j].id = this.parentNode.childNodes[j+m].id;
							this.parentNode.childNodes[j+m].style.backgroundImage = domBg;
							this.parentNode.childNodes[j+m].style.backgroundPosition = domBp;
							this.parentNode.childNodes[j+m].id = domId;
						}
					}else{
						for(var j = self.emptyIndex; j > index ; j=j-m){
							var domBg = this.parentNode.childNodes[j].style.backgroundImage;
							var domBp = this.parentNode.childNodes[j].style.backgroundPosition;
							var domId = this.parentNode.childNodes[j].id;
							this.parentNode.childNodes[j].style.backgroundImage = this.parentNode.childNodes[j-m].style.backgroundImage;
							this.parentNode.childNodes[j].style.backgroundPosition = this.parentNode.childNodes[j-m].style.backgroundPosition;
							this.parentNode.childNodes[j].id = this.parentNode.childNodes[j-m].id;
							this.parentNode.childNodes[j-m].style.backgroundImage = domBg;
							this.parentNode.childNodes[j-m].style.backgroundPosition = domBp;
							this.parentNode.childNodes[j-m].id = domId;
						}
					}
					self.emptyIndex = index;
					self.checkSuccess();
				}
			};
			divPic.ondblclick = function(){if(confirm('要放弃了吗???'))self.regain();};
								
			self.initialDiv[i] = divPic;
			self.initialId[i]  = divPic.id;
		}
		
		var shuffle = self.shuffle(rows, cols);
		for(var i = 0; i < shuffle.length; i++){
			var index = shuffle[i];
			if(!self.initialDiv[index].style.backgroundImage){
				self.emptyIndex = i;
			}
			puDiv.appendChild(self.initialDiv[index]);
//			self.initialDiv.splice(index,1);
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
	shuffle : function(x, y){
		var hold = 0;
		var i;
		var ri = new Array(15);
		var tileArray = [];
		for (i=0; i < x*y; i++){
			ri[i] = i;
			tileArray[i] = i;
		}
		for(var j=0; j<y; j++){
			ri.sort(function(){
				return Math.random()-0.5;
			});
			for (i=0; i < x*y; i+=y){
				hold = tileArray[ri[i]];
				tileArray[ri[i]] = tileArray[ri[i+1]];
				tileArray[ri[i+1]] = tileArray[ri[i+2]];
				tileArray[ri[i+2]] = hold;
			}
		}
		document.title = tileArray;
		return tileArray;
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
};

onload = function(){
	
	var Domimgs = document.getElementsByTagName('img');
	for(var index = 0; index < Domimgs.length; index++){
		if(Domimgs[index].width > 100 && Domimgs[index].height > 80 && Domimgs[index].className.indexOf('puzzle') != -1){
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
//兼容
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}());

var AudioViewCompoment = function(){ //定义单例
    var _styleLink=null;//所有对象实例公有参数
    var setParam=function(options){//所有对象实例公有函数
    }
    var _class = function(options){//内部类
        this.options=$.extend({
            parent:'body',
            canvas:'',
            audio:'',
            playBtn:null,
            stopBtn:null,
            pushBtn:null,
            deBtn:null,
            incBtn:null,
            callback:null
        },options);
        this.init();
    }
    _class.prototype = {//对象私有方法
        init : function(){//对象初始化
             this.initialize();
             this.addEvent();
             // this.startAni(); //开始音乐动画
             // console.log(this);
        },
        //绑定函数
        addEvent:function(){//事件绑定
            var self = this;
            console.log(self)
            if($(self.options.playBtn).length>0){
                $(self.options.playBtn).on('click',function(){
                    self.startAni();
                    self.play();
                });
            }
            if($(self.options.stopBtn).length>0){
                $(self.options.stopBtn).on('click',function(){
                    self.stop();
                });
            }
            if($(self.options.pushBtn).length>0){
                $(self.options.pushBtn).on('click',function(){
                    self.pushMus();
                });
            }
            if($(self.options.deBtn).length>0){
                $(self.options.deBtn).on('click',function(){
                    self.deVol();
                });
            }
            if($(self.options.incBtn).length>0){
                $(self.options.incBtn).on('click',function(){
                    self.incVol();
                });
            }
        },
        //获取音频数据
        getBufferLength:function() {
            this.array =  new Uint8Array(this.bufferLength);
            this.analys.getByteTimeDomainData(this.array);
            // console.log(this.array)
        },
        //开始音频
        play:function() {
            var self = this;
            if(!self.isPlaying){
                self.audio.play();
            }
        },
        //音频快进
        pushMus:function() {
            var self = this;
            self.audio.currentTime += 1;
        },
        //减少音量
        deVol:function() {
            var self = this;
            if(self.audio.volume-.1<=0){
                self.audio.volume = 0;
                return;
            }
            self.audio.volume -= .1;
        },
        //增大音量
        incVol:function() {
            var self = this;
            if(self.audio.volume+.1>=1){
                self.audio.volume = 1;
                return;
            }
            self.audio.volume += .1;
        },
        //音乐暂停
        stop:function(type) {
            var self = this;
            if(self.isPlaying){
                self.audio.pause();
                if(type == 1){
                    self.audio.currentTime = 0;
                }
            }
        },
        //动画逻辑
        ani:function(){
            var self = this;

            self.count++;
            if(self.count==self.speed){
                self.count=0;
                self.getBufferLength();
            }
            if(self.isPlaying){
                self.Alpha += 0.01;
            }else {
                self.Alpha -= 0.01;
            }
            if(self.Alpha >= 2)self.Alpha = 1;
            if(self.Alpha <= 0)self.Alpha =0;
            // console.log(self)
            self.ctx.globalAlpha=self.Alpha;

            self.ctx.clearRect(0, 0, self.canvasW, self.canvasH);

            self.ctx.lineWidth = 2;
            self.ctx.strokeStyle = 'rgba(20, 230, 235,0.3)';

            self.ctx.beginPath();

            var sliceWidth = self.canvasW / self.array.length;
            // console.log('sliceWidth '+sliceWidth)
            var x = 0;
            for(var i = 0; i < self.array.length; i++) {

                if(!self.curArray[i]){
                    // console.log(i + ' x ' + curArray[i] )
                    self.curArray[i] = 128;
                }
                self.curArray[i] += (self.array[i] - self.curArray[i])/self.speed; 
                /**上面的speed在这里控制波幅和变化快慢速度，暂时没有吧波幅和速度独立开来控制，建议暂时不更改**/
                var y = self.curArray[i]/ 128 * self.canvasH / 2;

                if (i === 0) {
                    self.ctx.moveTo(x, y);

                } else {
                    self.ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            self.ctx.lineTo(self.canvasW, self.canvasH/2);
            self.ctx.stroke();

            // var time = new Date().getTime();
            // (function aniSt() {
            //     var now = new Date().getTime(),during=now-time;
            //     if (during<self.options.speed) {
                    
            //     }else{
            //         time = now;
            //         setTimeout(function(){ //成功
            //             self.ani.call(self)
            //         },100);
            //     }
            //     self.setInterval = requestAnimationFrame(aniSt);
            // })();
            // setTimeout(function(){ //成功
            //     self.ani.call(self)
            // },16);
            self.interval = requestAnimationFrame(function(){
                self.ani.call(self);   
            }); //报错
            // console.log(self.interval)
        },
        //取消动画
        cancelAni : function(){
            var self = this;
            cancelAnimationFrame(self.interval);
            self.interval = null;
        },
        //开始动画
        startAni:function(){
            var self = this;
            if(!self.interval){
                self.interval = requestAnimationFrame(function(){
                    self.ani.call(self);   
                });
            }
        },
        initialize:function(){
            var self = this;
            

            try {
                self.context = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext);
                self.audioAllow = true;
            } catch(e) {
                self.audioAllow = false;
            }
            if(self.audioAllow){  
                self.isPlaying = false;
                self.interval = null;
                self.curArray = [];   
                self.canvasW = $(self.options.parent).width(),
                self.canvasH = $(self.options.parent).height();
                if($(self.options.canvas).length > 0){
                    $(self.options.canvas)[0].width = self.canvasW;
                    $(self.options.canvas)[0].height = self.canvasH;
                }

                self.audio = $(self.options.audio)[0];
                self.canvas = $(self.options.canvas)[0];
                self.ctx = self.canvas.getContext("2d");
                self.options.count ?(self.count = self.options.count):(self.count = 0);
                self.options.Alpha ?(self.Alpha = self.options.Alpha):(self.Alpha = 0);
                self.options.speed ?(self.speed = self.options.speed):(self.speed = 4);
                self.Alpha = 0;
                // self.audio.play();
                self.analys=self.context.createAnalyser();
                // console.log(self.analys)
                self.analys.fftSize = 512;
                self.bufferLength = self.analys.frequencyBinCount;
                // console.log(self.bufferLength)//256
                // console.log(self.audio)
                self.source = self.context.createMediaElementSource(self.audio);
                // console.log(self.audio)
                /**
                *createMediaElementSource这个函数一旦启用，在高版本chrome下，跨域调用音频会，音乐能播放，但没有声音
                *解决方式1、有说在audio标签中加crossOrigin="anonymous" 这个属性（firefox好像没这个问题）
                *2、还有一个原因是，高版本chrome中，本函数可能要在服务器环境运行，本地文件直接打开页面是不行的，一定要
                *启动一个虚拟服务器，比如fis3，然后在服务器上调用，就不会有这个跨域调用问题了
                **/
                
                self.source.connect(self.analys);
                self.analys.connect(self.context.destination);

                self.audio.addEventListener('play', function(e) {
                    self.isPlaying = true;
                }, false);

                self.audio.addEventListener('pause', function(e) {
                    self.isPlaying = false;
                }, false);

                self.getBufferLength();
                // self.ani();
            }
            else{
                $(self.options.audio).remove();
                $(self.options.canvas).remove();
            }
            
        }
    }
    return {
        setting:function(options){//提供给外部调用的方法，修改所有实例的公有参数
             setParam(options);
        },
        //开始音频
        play:_class.play,
        //音频快进
        pushMus:_class.pushMus,
        //减少音量
        deVol:_class.deVol,
        //增大音量
        incVol:_class.incVol,
        //音乐暂停
        stop:_class.stop,
        //开始音乐动画
        startAni:_class.startAni,
        create : function(options){//提供给外部调用的方法，创建实例
            return new _class(options);
        }
    }
}();
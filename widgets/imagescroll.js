function special(aa,maxsteps,changetime,everystime,verticals){
		$time2=$time3=null;
		$sw=0;
		$c=$("#outer img");
		//$("<img src='1.jpg'/>").appendTo($("#inner"));
		$a=$("#outer img").width();
		$h=$("#outer img").height();
		$b=$("#outer img:last").index()+1;
		$("#scrollp").width($a);
		$("#outer").width($a).height($h).css("overflow","hidden");
		$("#inner").css("overflow","hidden");
		$("#p").css("cursor","pointer");
		$("span").css("float","left")
		if (verticals=="updown") {
			$("#inner").width($a);
		}else{
			$("#inner").width($a*$b);
		}
		$("<span class='aa'><</span>").appendTo("p")
		$c.each(function() {
			$("<span>"+($(this).index()+1)+"</span>").appendTo("p")
		})
		$("<span class='aa'>></span>").appendTo("p")
		$spanw=($("#p span").width())*($("#p span:last-child").index()+1)
		//$("p").css({"left":+(($("body").width()-($sw+30*2))/2)+"px","top":($("#outer").height()-$("p").height()-20)+"px"})
		$("#p").css("padding-left",(($("p").width()-$spanw)/2)+"px")
		$num=0;
		$time1=setInterval(main,changetime)
		function lanse(){
			$("#p span").each(function(){
				$(this).css("background","");
			})
			$("#p span").eq($num+1).css("background","pink")
		}
		$("#p span:not(.aa)").on("click",function(){
			clearInterval($time1);
			$num=$(this).index()-1
			move();
			lanse();
			$time1=setInterval(main,changetime)
		})
		$("#p span:first-child").on("click",function(){
			if (verticals=="updown") {
				if ($("#outer").scrollTop()%$h==0) {
					clearInterval($time1)
					$num=$("#outer").scrollTop()/$h;
					$num=$num-1;
					if ($num<0) {
						$num=$b-1;
					};
					lanse();
					move();
					$time1=setInterval(main,changetime)
				}	
			}else if($("#outer").scrollLeft()%$a==0){
				clearInterval($time1)
				$num=$("#outer").scrollLeft()/$a;
				$num=$num-1;
				if ($num<0) {
					$num=$b-1;
				};
				lanse();
				move();
				$time1=setInterval(main,changetime)
			}
		})
		$("#p span:last-child").on("click",function(){
			if (verticals=="updown") {
				if ($("#outer").scrollTop()%$h==0) {
					clearInterval($time1)
					$num=$("#outer").scrollTop()/$h;
					$num=$num+1;
					if ($num==$b) {
						$num=0;
					};
					lanse();
					move();
					$time1=setInterval(main,changetime)
				}	
			}else if($("#outer").scrollLeft()%$a==0){
				clearInterval($time1)
				$num=$("#outer").scrollLeft()/$a;
				$num=$num+1;
				if ($num==$b) {
					$num=0;
				};
				lanse();
				move();
				$time1=setInterval(main,changetime)
			}
		})
		$("#outer").mouseover(function(){
			clearInterval($time1)
			clearInterval($time2)
			clearInterval($time3)
		})
		$("#outer").mouseout(function(){
			clearInterval($time1)
			$time1=setInterval(main,changetime)
		})
		function main(){
			 $num++;
			if ($num==$b) {
				$num=0;
			};
			lanse();
			move();
		}
		function move(){
			if (verticals=="updown") {
				clearInterval($time3)
				$start=$("#outer").scrollTop();
				$end=$h*$num;
				$maxstep=maxsteps;
				$step=0;
				$everystep=($end-$start)/$maxstep
				// $time3=setInterval(hh,2000)
				$time3=setInterval(hh,everystime)
				//hh()
				function hh(){
					$step++;
					$start+=$everystep
					$("#outer").scrollTop(aa($step,$start,$end-$start,$maxstep));
					if ($step==$maxstep) {
						clearInterval($time3);
					}
				}
			} else{
				clearInterval($time2)
				$start=$("#outer").scrollLeft();
				$end=$a*$num;
				$maxstep=maxsteps;
				$step=0;
				$everystep=($end-$start)/$maxstep;
				$time2=setInterval(scrolls,everystime)
				function scrolls(){
					$step++;
					$start+=$everystep
					$("#outer").scrollLeft(aa($step,$start,$end-$start,$maxstep));
					if ($step==$maxstep) {
						clearInterval($time2);
					}
				}
			}
			
		}
	}
	$Tween = {
		    Linear: function(t,b,c,d){ return c*t/d + b; },///////////////////////////////无缓动效果
		    Quadratic: {                                        //////////////////////////////二次方的缓动（t^2）；
		        easeIn: function(t,b,c,d){                      //////////////效果不明显
		            return c*(t/=d)*t + b;
		        },
		        easeOut: function(t,b,c,d){
		            return -c *(t/=d)*(t-2) + b;
		        },
		        easeInOut: function(t,b,c,d){
		            if ((t/=d/2) < 1) return c/2*t*t + b;
		            return -c/2 * ((--t)*(t-2) - 1) + b;
		        }
		    },
		    Cubic: {                                       ///////////////////////////////三次方的缓动（t^3）；
		        easeIn: function(t,b,c,d){                  //////////////效果不明显
		            return c*(t/=d)*t*t + b;
		        },
		        easeOut: function(t,b,c,d){
		            return c*((t=t/d-1)*t*t + 1) + b;
		        },
		        easeInOut: function(t,b,c,d){
		            if ((t/=d/2) < 1) return c/2*t*t*t + b;
		            return c/2*((t-=2)*t*t + 2) + b;
		        }
		    },
		    Quartic: {                                        ///////////////////////////////四次方的缓动（t^4）；
		        easeIn: function(t,b,c,d){                      //////////////效果不明显
		            return c*(t/=d)*t*t*t + b;
		        },
		        easeOut: function(t,b,c,d){
		            return -c * ((t=t/d-1)*t*t*t - 1) + b;
		        },
		        easeInOut: function(t,b,c,d){
		            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		            return -c/2 * ((t-=2)*t*t*t - 2) + b;
		        }
		    },
		    Quintic: {                                        ///////////////////////////////五次方的缓动（t^5）；
		        easeIn: function(t,b,c,d){                       //////////////效果不明显
		            return c*(t/=d)*t*t*t*t + b;
		        },
		        easeOut: function(t,b,c,d){
		            return c*((t=t/d-1)*t*t*t*t + 1) + b;
		        },
		        easeInOut: function(t,b,c,d){
		            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		            return c/2*((t-=2)*t*t*t*t + 2) + b;
		        }
		    },
		   Sinusoidal: {                                         ////////////////////////////////正弦曲线的缓动（sin(t)）；
		        easeIn: function(t,b,c,d){                         //////////////效果不明显
		            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		        },
		        easeOut: function(t,b,c,d){
		            return c * Math.sin(t/d * (Math.PI/2)) + b;
		        },
		        easeInOut: function(t,b,c,d){
		            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		        }
		    },
		   Exponential: {                                          /////////////////////////////指数曲线的缓动（2^t）；
		        easeIn: function(t,b,c,d){                         ///////////////////效果不明显
		            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		        },
		        easeOut: function(t,b,c,d){
		            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		        },
		        easeInOut: function(t,b,c,d){
		            if (t==0) return b;
		            if (t==d) return b+c;
		            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		        }
		    },
		    Circular: {                                            ///////////////////////////圆形曲线的缓动（sqrt(1-t^2)）；
		        easeIn: function(t,b,c,d){                          ////////图片出现时的速度是匀加速的
		            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		        },
		        easeOut: function(t,b,c,d){                         ////////图片出现时的速度是匀减速的
		            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		        },
		        easeInOut: function(t,b,c,d){                       //////效果不明显，先做匀加速再做匀减速的运动；
		            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		        }
		    },
		    Elastic: {                                          /////////////////////////指数衰减的正弦曲线缓动；
		        easeIn: function(t,b,c,d,a,p){          ////三种效果基本没区别，效果是图片左右震弹，同时感觉图片是从反向出现
		            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		            else var s = p/(2*Math.PI) * Math.asin (c/a);
		            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		        },
		        easeOut: function(t,b,c,d,a,p){
		            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		            else var s = p/(2*Math.PI) * Math.asin (c/a);
		            return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
		        },
		        easeInOut: function(t,b,c,d,a,p){
		            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		            else var s = p/(2*Math.PI) * Math.asin (c/a);
		            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		        }
		    },
		    Back: {                                         //////////////////////超过范围的三次方缓动（(s+1)*t^3 - s*t^2）；
		        easeIn: function(t,b,c,d,s){                ////先将上张图片拉出一段，再呈现下张图；
		            if (s == undefined) s = 1.70158;
		            return c*(t/=d)*t*((s+1)*t - s) + b;
		        },
		        easeOut: function(t,b,c,d,s){               ///先将下张图片呈现后，再将下下张图拉出一段，随即呈现需要的图
		            if (s == undefined) s = 1.70158;
		            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		        },
		        easeInOut: function(t,b,c,d,s){             //上面两种效果都会出现；
		            if (s == undefined) s = 1.70158; 
		            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		        }
		    },
		    Bounce: {                                       ///////////////////////////指数衰减的反弹缓动。
		        easeIn: function(t,b,c,d){                  //先小幅度弹，再大幅度弹；
		            return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
		        },
		        easeOut: function(t,b,c,d){                 //先大幅度弹到顶点，在小幅度振谈；
		            if ((t/=d) < (1/2.75)) {
		                return c*(7.5625*t*t) + b;
		            } else if (t < (2/2.75)) {
		                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		            } else if (t < (2.5/2.75)) {
		                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		            } else {
		                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		            }
		        },
		        easeInOut: function(t,b,c,d){               //内外折中；
		            if (t < d/2) return Tween.Bounce.easeIn(t*2, 0, c, d) * .5 + b;
		            else return Tween.Bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
		        }
		    }
	}
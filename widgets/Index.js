var $body = document.getElementsByTagName("body")[0];
var $cleft = document.getElementsByClassName("cleft")[0];
var $cright = document.getElementsByClassName("cright")[0];
var h = document.documentElement.clientHeight;
$body.style.height = h + "px";
if (h > 850) {
    $cleft.style.marginTop = 200 + "px";
    $cright.style.marginTop = 200 + "px";
}
var $login = document.getElementById("login");
var $admin = document.getElementById("admin");
var $password = document.getElementById("password");
var $dapartchoose = document.getElementById("dapartchoose");
var pathName = window.document.location.pathname;
//projectName:string
//当前项目路径
var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

var getData=function () { 
    var xhr = new XMLHttpRequest()
    xhr.open("post", projectName+"/widgets/handler/Index.ashx", true);  
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send("methodName=Login" + "&name=" + $admin.value + "&password=" + $password.value + "&dapart=" + $dapartchoose.value)
    xhr.onload = function () {
        var datas = eval("(" + xhr.responseText + ")")
        if (datas.data!=0){
            sessionStorage.setItem("dat", xhr.responseText);
            window.open(projectName + "/index1.html","_self")
        } else {
            alert("请重新核对用户名，密码，部门")
        }
    }
}
document.onkeydown = function (e) {
    if (e.key == "Enter") {
        getData()
    }
}
$login.onclick = function () {
    getData()
}
//var xhr1 = new XMLHttpRequest()
//xhr1.open("post", projectName + "/widgets/handler/NearCityWeather.ashx", true);
//xhr1.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//xhr1.send("methodName=GetNearCityWeather")
//xhr1.onload = function () {
//    var datas = eval("(" + xhr1.responseText + ")")
//    addDom(datas)
//    NearCityWeather(datas)
//}
function addDom(data) {
    var $pageTittle = document.getElementById("pageTittle")
    var $contentTab = document.getElementById("contentTab")
    var $pageTittleLi = "", $contentTabSection = "";
    for (var i = 1; i < data.length; i++) {
        $pageTittleLi += "<li class='pageTittleLi'>" + data[i].CityName + "</li>"
        $contentTabSection += "<section class='TabSection'><p><lable>AQI:</lable><span>" + data[i].AQI + "</span><span style='display:inline-block;width:50px;height;20px;line-height:20px;margin-left:5px;text-align:center;background:" + data[i].colour + ";'>" + data[i].quality + "</span></p><p><lable>天气：</lable><span>" + data[i].temp + data[i].weather + "</span></p><p><span>" + data[i].winddirection + "</span><span>（" + data[i].windspeed + "级）</span><span>湿度" + data[i].humi + "%</span></p></section>"
    }
    $contentTabSection += "<section class='TabSection'><p><lable>AQI:</lable><span>" + data[0].AQI + "</span><span style='display:inline-block;width:50px;height;20px;line-height:20px;margin-left:5px;text-align:center;background:" + data[0].colour + ";'>" + data[0].quality + "</span></p><p><lable>天气:</lable><span>" + data[0].temp + data[0].weather + "</span></p><p><span>" + data[0].winddirection + "</span><span>（" + data[0].windspeed + "级）</span><span>湿度" + data[0].humi + "%</span></p></section>"
    $pageTittleLi += "<li class='pageTittleLi'>" + data[0].CityName + "</li>"
    $pageTittle.innerHTML = $pageTittleLi;
    $contentTab.innerHTML = $contentTabSection
}
//tab切换；
function NearCityWeather() {
    var oli = pageTittle.getElementsByTagName('li');
    var odiv = contentTab.getElementsByTagName('section');
    for (var i = 0; i < oli.length; i++) {
        oli[i].a = i;
        oli[i].onmouseover = function () {
            for (var j = 0; j < oli.length; j++) {
                oli[j].style.background = "";
                odiv[j].style.display = "none";
            };
            this.style.background = "#f1ab00";
            odiv[this.a].style.display = "block";
            odiv[this.a].style.left=this.a*81+"px"
        }
    };
}
 
﻿
$(function () {
    // 检查插件是否已经安装过
    function OnInit() {
        document.getElementById('ocxContainer').innerHTML = '<object classid="clsid:E55C9850-D54F-4DF2-A7B4-B8C3B687BE2F" id="preview"  width="500" height="300" name="ocx" ></object>';
        var _right = "10034,10033,10032,10020,10027,10014,10001,10028,10002,10015,10005,10010,10024,10006,10011,10003,10021,10012,10022,10004,10013,10009,10029";
        var rightcodestate = preview.SetRightCode(_right);

        var _toolbar = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
            + "<ToolBar><Item type=\"0\" /><Item type=\"24\" /><Item type=\"5\" />"
            + "<Item type=\"6\" /><Item type=\"7\" /><Item type=\"8\" />"
            + "<Item type=\"9\" /><Item type=\"10\" /><Item type=\"12\" />"
            + "<Item type=\"17\" /><Item type=\"20\" /><Item type=\"21\" />"
            + "<Item type=\"22\" /></ToolBar>";
        var ToolBarstate = preview.SetToolBar(_toolbar);

        preview.SetToolBarAlwaysShow(1);
        preview.SetInstPlayCfg(30);
        var _snap = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
            + "<SnapShot><PicType>jpeg</PicType><Quality>80</Quality><SnapMulti>1</SnapMulti>"
            + "<SnapTimes>3</SnapTimes><TimeSpan>1</TimeSpan><SaveFolder>C:\\hikvisiontest</SaveFolder><KeyWords></KeyWords></SnapShot>";
        var SnapParamstate = preview.SetSnapParam(_snap);


        var _record = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
            + "<VideoRecord><PackType>0</PackType><MaxRecTime>0</MaxRecTime>"
            + "<PackTime>100</PackTime><PackSize>100</PackSize><SaveFolder>C:\\hikvisiontest</SaveFolder><KeyWords></KeyWords></VideoRecord>";
        var RecordParamstate = preview.SetRecordParam(_record);


    }

    OnInit();
    function OnStartPreview() {

        var camIndexCode = GetQueryString('CamIndexCode');
        var devIndexCode = GetQueryString('DevIndexCode');
        var name = GetQueryString('name');
        var _param = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
            + "<Preview>"
            + "<CamIndexCode>" + camIndexCode + "</CamIndexCode>"//摄像头编码
            + "<DevIndexCode>" + devIndexCode + "</DevIndexCode>"//设备编码
            + "<UserName>admin</UserName>" //验证
            + "<PassWord>Admin123</PassWord>"//验证
            + "<UserLevel>50</UserLevel>"
            + "<CamName>" + name + "</CamName>"//摄像头名称
            + "<DevType>0</DevType>"
            + "<ChannelNo>1</ChannelNo>"//验证
            + "<LinkType>1</LinkType>"
            + "<StreamType>1</StreamType>"//0-main 1--child
            + "<SubStream>MAIN</SubStream>"
            + "<NetZone cnid=\"1\" pnid=\"1\"/>"
            + "<StreamSvr>"
            + "<Svr type=\"3\" ip=\"192.168.31.15\" port=\"7302\"/>"//验证
            + "</StreamSvr>"
            + "<ProSeries>201</ProSeries>"
            + "<TreatyType>SDK</TreatyType>"
            + "<FishEyeInfo>"
            + "<InstallType></InstallType>"
            + "<VideoDevType>16</VideoDevType>"
            + "</FishEyeInfo>"
            + "</Preview>";
        //alert(_param);

        var StartPreviewExstate = preview.StartPreviewEx(_param);

    }
    //
    function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    OnStartPreview()

    function OnStopPreview() {
        var StopPreviewstate = preview.StopPreview();

    }
});
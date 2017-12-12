﻿//网格化系统名称
var sysName = '安次区网格化环境管理平台';

//一级网格
var gridCode = '131002000000';

//二级网格
var secondGridCode = '131002100,131002600,131002101,131002001,131002202,131002104,131002103,131002105,131002201,131002102,131002200';

//指挥调度、巡查监督中查询条件，此处不能用name，只能用label
var secondCon = '[{ id: "all", label: "全部" }, ' +
    '{ id: "131002100", label: "落垡镇" }, ' +
    '{ id: "131002600", label: "管道局农场" }, ' +
    '{ id: "131002101", label: "码头镇" }, ' +
    '{ id: "131002001", label: "北史家务乡" }, ' +
    '{ id: "131002202", label: "调河头乡" }, ' +
    '{ id: "131002104", label: "廊坊市辖区3街道" }, ' +
    '{ id: "131002103", label: "东沽港镇" }, ' +
    '{ id: "131002105", label: "廊坊市辖区6街道" }, ' +
    '{ id: "131002201", label: "仇庄乡" },' +
    '{ id: "131002102", label: "葛渔城镇" },' +
    '{ id: "131002200", label: "杨税务乡" }]';
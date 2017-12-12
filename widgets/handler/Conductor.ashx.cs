using System;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;
using HJJC.BLL;
using cn.jpush.api;
using cn.jpush.api.push.mode;
using HJJC.Service;
using cn.jpush.api.common;
using cn.jpush.api.common.resp;
using cn.jpush.api.push.notification;
using System.Web.SessionState;
using HJJC.SQLServerDAL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// Conductor 的摘要说明
    /// </summary>
    public class Conductor : IHttpHandler, IRequiresSessionState
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllConductor":
                    {
                        GetAllConductorByGridStatus();
                        break;
                    }
                case "SendContentCode":
                    {
                        SecondContentCode(context);
                        break;
                    }
                case "SendSMSContentCode":
                    {
                        SendSMSContentCode(context);
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        //接受推送信息
        private void SecondContentCode(HttpContext context)
        {
            var msgContent = context.Request.Params["content"];
            var userId = context.Request.Params["userId"];
            var senderId = string.IsNullOrEmpty(context.Request.Params["senderId"]) ? 0 : Convert.ToInt32(context.Request.Params["senderId"]);
            string[] userIds = userId.Split(',');
            var query = userIds.Aggregate(string.Empty, (current, s) => current + ("'" + s + "',"));
            query = query.Substring(0, query.LastIndexOf(','));

            string[] registrationId;
            var conductorManager = new ConductorManager();
            var dtRegistration = conductorManager.GetRegistrationIds(query);
            if (dtRegistration != null && dtRegistration.Rows.Count > 0)
            {
                registrationId = dtRegistration.Rows.Cast<DataRow>().Select(o => o["PhoneId"].ToString()).ToArray();
                //开发者标识
                var appKeyAndrow = ServiceLocator.DevKey;
                var masterSecretAndrow = ServiceLocator.DevSecret;
                var alert = ServiceLocator.AppAlert;//推送提示
                //var title = ServiceLocator.AppTitle;//推送标题
                JPushClient clientAndrow = new JPushClient(appKeyAndrow, masterSecretAndrow);

                PushPayload payload = PushObject(registrationId, alert);
                payload.ResetOptionsApnsProduction(true);
                try
                {
                    DateTime lssuedTime = DateTime.Now;
                    //var lssuedPeople = 0;
                    var result = clientAndrow.SendPush(payload);
                    System.Threading.Thread.Sleep(10000);
                    //查询推送结果
                    var apiResult = clientAndrow.getReceivedApi_v3(result.msg_id.ToString());
                    if (apiResult.isResultOK())//发送成功
                    {
                        conductorManager.Insert(senderId, lssuedTime, msgContent, userIds);
                        context.Response.Write("{\"msg\":\"Ok\"}");
                    }
                }
                catch (APIRequestException e)
                {
                    context.Response.Write("{\"msg\":\"Error\"}");
                }
                catch (APIConnectionException e)
                {
                    context.Response.Write("{\"msg\":\"Error\"}");
                }
            }
            else
            {
                context.Response.Write("{\"msg\":\"Error\"}");
            }
        }


        //接受推送信息
        private void SendSMSContentCode(HttpContext context)
        {
            //var senderOid = 0;
            var senderOid = string.IsNullOrEmpty(context.Request.Params["senderId"]) ? 0 : Convert.ToInt32(context.Request.Params["senderId"]);
            var attributeTableService = new AttributeTableService();
            var msgContent = context.Request.Params["content"];
            var accper = context.Request.Params["tel"];
            DateTime fsDate = DateTime.Now;
            string[] userIds = accper.Split(',');
            var count = userIds.Length;
            try
            {
                for (var i = 0; i < count; i++)
                {
                    var insertSql = "insert into t_SMS(t_SMSOID,Content,SenderOID,SendTime,StateCode,Accper) values('" + Guid.NewGuid() + "','" + msgContent + "','" + senderOid + "','" + fsDate + "','0901','" + userIds[i] + "') ";
                    attributeTableService.Execute(insertSql);
                }
                context.Response.Write("{\"msg\":\"Ok\"}");
            }
            catch (Exception)
            {
                context.Response.Write("{\"msg\":\"Error\"}");
                throw;
            }
        }

        /// <summary>
        /// 极光推送主体 Android
        /// </summary>
        /// <param name="registrationId"></param>
        /// <param name="alert"></param>
        /// <param name="title"></param>
        /// <returns></returns>
        private PushPayload PushObject(string[] registrationId, string alert, string title)
        {
            var pushPayload = new PushPayload();
            pushPayload.platform = Platform.all();
            pushPayload.audience = Audience.s_registrationId(registrationId);
            pushPayload.notification = new Notification()
                               .setAlert(alert)
                               .setAndroid(new AndroidNotification().setTitle(title));
            return pushPayload;
        }

        /// <summary>
        /// 极光推送主体 Android and  IOS
        /// </summary>
        /// <param name="registrationId"></param>
        /// <param name="alert"></param>
        /// <returns></returns>
        private PushPayload PushObject(string[] registrationId, string alert)
        {
            var pushPayload = new PushPayload
            {
                platform = Platform.all(),
                audience = Audience.s_registrationId(registrationId),
                notification = new Notification()
                    .setAlert(alert).setIos(new IosNotification().incrBadge(1))
            };
            return pushPayload;
        }

        /// <summary>
        /// 带参数
        /// </summary>
        private void GetAllConductorByGridStatus()
        {
            HttpContext context = HttpContext.Current;
            var conductorManager = new ConductorManager();
            var orgName = context.Request.Params["partment"];
            var personName = context.Request.Params["personName"];
            var gridName = context.Request.Params["gridName"];
            if (orgName.IndexOf("all", StringComparison.Ordinal) != -1)
            {
                orgName = ConfigurationManager.AppSettings["secondGridCode"];
            }
            var status = context.Request.Params["type"];
            if (status.IndexOf("all", StringComparison.Ordinal) != -1)
            {
                status = "在线,未签到,历史签到";
            }
            var dt = conductorManager.GetAllConductorAreaList(orgName, status, personName, gridName);

            string str = DataTableToJson(dt);
            if (dt.Rows.Count == 0) { str = "{\"status\":false}"; }
            else
            {
                str = "{\"status\":true,\"data\":" + str + "}";
            }
            str = str.Replace("\r\n", "").Replace("\n", "").Replace("\r\n", "").Replace(Environment.NewLine, "");

            context.Response.Write(str);
        }
        private string DataTableToJson(DataTable dt)
        {
            StringBuilder json = new StringBuilder();
            if (dt.Rows.Count > 0)
            {
                json.Append("[");
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    json.Append("{");
                    for (int j = 0; j < dt.Columns.Count; j++)
                    {
                        json.Append("\"" + dt.Columns[j].ColumnName + "\":\"" + dt.Rows[i][j] + "\"");
                        if (j < dt.Columns.Count - 1)
                        {
                            json.Append(",");
                        }
                    }
                    json.Append("},");
                }
                json.Remove(json.Length - 1, 1);
                json.Append("]");
            }
            return json.ToString();
        }
        public bool IsReusable => false;
    }
}
using System;
using System.Configuration;
using System.Data;
using System.Text;
using System.Web;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// Patrol 的摘要说明
    /// </summary>
    public class Patrol : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllPatrolAreas":
                    {
                        GetAllPatrolByOrgAndStatus();
                        break;
                    }
                case "GetPatrolInfoByUserCode":
                    {
                        GetPatrolInfoByUserCode();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
        private void GetAllPatrolByOrgAndStatus()
        {
            var context = HttpContext.Current;
            var patrolManager = new PatrolManager();
            var orgName = context.Request.Params["partment"];
            if (orgName.IndexOf("all", StringComparison.Ordinal) != -1)
            {
                orgName = ConfigurationManager.AppSettings["secondGridCode"];
            }
            var status = context.Request.Params["type"];
            if (status.IndexOf("all", StringComparison.Ordinal) != -1)
            {
                status = "在线,未签到,历史签到";
            }
            var dt = patrolManager.GetAllPatrolAreaList(orgName,status);
           
            string str = DataTableToJson(dt);
            if (dt.Rows.Count==0) { str = "{\"status\":false}"; }
            else
            {
                str = "{\"status\":true,\"data\":"+ str + "}";
            }
            str = str.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(str);
        }

        private void GetPatrolInfoByUserCode()
        {
            var context = HttpContext.Current;
            var userId = context.Request.Params["userId"];
            var patrolDate= context.Request.Params["patrolDate"];
            var strDate = patrolDate+" " + context.Request.Params["strDate"];
            var endDate = patrolDate +" "+ context.Request.Params["endDate"];
            var patrolManager = new PatrolManager();
            var dt = patrolManager.GetPatrolInfoByUserCode(userId, strDate, endDate);
            string str = DataTableToJson(dt);
            if (dt.Rows.Count == 0) { str = "{\"status\":false}"; }
            else
            {
                str = "{\"status\":true,\"data\":" + str + "}";
            }
            str = str.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(str);
        }

        private string DataTableToJson(DataTable dt)
        {
            var json = new StringBuilder();
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
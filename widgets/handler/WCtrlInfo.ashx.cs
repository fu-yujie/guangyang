using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Text;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// WCtrlInfo 的摘要说明
    /// </summary>
    public class WCtrlInfo : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetWControllerInfo":
                    {
                        GetWControllerInfo();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        private void GetWControllerInfo()
        {
            HttpContext context = HttpContext.Current;
            string code = context.Request.Params["code"].ToString().Trim() == "" ? "-1" : context.Request.Params["code"].ToString().Trim();
            WCtrlInfoManager wCtrlInfoManager = new WCtrlInfoManager();
            DataTable dt = wCtrlInfoManager.GetWControllerInfo("sc.JcType ='2' and pe.BusinessType='04' and sc.Code ='"+code+"'");
            DataView dv = dt.DefaultView;
            dv.Sort = "MonitoringTime asc";
            DataTable ascDt = dv.ToTable();
            string str = DataTableToJson(ascDt);
            str = str.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(str);
        }
        private string DataTableToJson( DataTable dt)
        {
            StringBuilder Json = new StringBuilder();
            if (dt.Rows.Count > 0)
            {
                Json.Append("[");
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    Json.Append("{");
                    for (int j = 0; j < dt.Columns.Count; j++)
                    {
                        Json.Append("\"" + dt.Columns[j].ColumnName.ToString() + "\":\"" + dt.Rows[i][j].ToString() + "\"");
                        if (j < dt.Columns.Count - 1)
                        {
                            Json.Append(",");
                        }
                    }
                    Json.Append("},");
                }
                Json.Remove(Json.Length - 1, 1);
                Json.Append("]");
            }
            return Json.ToString();
        }
        public bool IsReusable => false;
    }
}
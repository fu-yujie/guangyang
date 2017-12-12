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
    /// WController 的摘要说明
    /// </summary>
    public class WController : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllWController":
                    {
                        GetAllWController();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        private void GetAllWController()
        {
            HttpContext context = HttpContext.Current;
            WControllerManager wControllerManager = new WControllerManager();
            DataTable dt = wControllerManager.GetWController("sc.type='02'");     
            string str = DataTableToJson(dt);
            str = str.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(str);
        }

        //将表格转换成JSON字符串
        private string DataTableToJson(DataTable dt)
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
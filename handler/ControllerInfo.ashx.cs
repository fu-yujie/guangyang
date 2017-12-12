using System.Web;
using System.Data;
using System.Text;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// WCtrlInfo 的摘要说明
    /// </summary>
    public class ControllerInfo : IHttpHandler
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
                        
                    }
                    break;
                case "GetGControllerInfo":
                    {
                        GetGControllerInfo();
                    }
                    break;
                case "GetSControllerInfo":
                    {
                        GetSControllerInfo();
                    }
                    break;
                default:
                    {
                        break;
                    }
            }
        }

        private void GetSControllerInfo()
        {
            HttpContext context = HttpContext.Current;
            string code = context.Request.Params["code"].Trim() == "" ? "-1" : context.Request.Params["code"].Trim();
            ControllerInfoManager wCtrlInfoManager = new ControllerInfoManager();
            DataTable dt = wCtrlInfoManager.GetSControllerInfo("sc.type ='03' and pe.BusinessType='05' and sc.Code ='" + code + "'");
            DataView dv = dt.DefaultView;
            dv.Sort = "MonitoringTime asc";
            DataTable ascDt = dv.ToTable();
            string str = DataTableToJson(ascDt);
            str = str.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(str);
        }

        private void GetWControllerInfo()
        {
            HttpContext context = HttpContext.Current;
            string code = context.Request.Params["code"].Trim() == "" ? "-1" : context.Request.Params["code"].Trim();
            ControllerInfoManager wCtrlInfoManager = new ControllerInfoManager();
            DataTable dt = wCtrlInfoManager.GetWControllerInfo("sc.type ='02' and pe.BusinessType='04' and sc.Code ='" + code + "'");
            DataView dv = dt.DefaultView;
            dv.Sort = "MonitoringTime asc";
            DataTable ascDt = dv.ToTable();
            string str = DataTableToJson(ascDt);
            str = str.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(str);
        }

        private void GetGControllerInfo()
        {
            HttpContext context = HttpContext.Current;
            string code = context.Request.Params["code"].Trim() == "" ? "-1" : context.Request.Params["code"].Trim();
            ControllerInfoManager gCtrlInfoManager = new ControllerInfoManager();
            DataTable dt = gCtrlInfoManager.GetGControllerInfo("sc.type ='01' and pe.BusinessType='03'  and sc.Code ='" + code + "'");
            DataView dv = dt.DefaultView;
            dv.Sort = "MonitoringTime asc";
            DataTable ascDt = dv.ToTable();
            string str = DataTableToJson(ascDt);
            str = str.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(str);
        }

        private string DataTableToJson( DataTable dt)
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
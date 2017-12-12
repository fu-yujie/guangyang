using System.Data;
using System.Text;
using System.Web;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// SController 的摘要说明
    /// </summary>
    public class SController : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllSController":
                    {
                        GetAllSController();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        private void GetAllSController()
        {
            HttpContext context = HttpContext.Current;
            var sControllerManager = new SControllerManager();
            DataTable dt = sControllerManager.GetSController("sc.type='03'");
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
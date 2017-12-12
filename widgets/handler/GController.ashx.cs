using System.Web;
using System.Data;
using System.Text;
using HJJC.BLL;


namespace HJJC.widgets.handler
{
    /// <summary>
    /// GController 的摘要说明
    /// </summary>
    public class GController : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllGController":
                    {
                        GetAllGController();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        /// <summary>
        /// 获取所有的监控点
        /// </summary>
        private void GetAllGController()
        {
            HttpContext context = HttpContext.Current;
            GControllerManager gControllerManager = new GControllerManager();
            DataTable dt = gControllerManager.GetGController("sc.type='01'");
            string str = DataTableToJson(dt);
            str = str.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(str);
        }

        //将表格转换成JSON字符串
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
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
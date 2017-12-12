using HJJC.BLL;
using System.Data;
using System.Text;
using System.Web;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// NearCityWeather 的摘要说明
    /// </summary>
    public class NearCityWeather : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            //context.Response.Write("Hello World");

            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetNearCityWeather":
                    {
                        GetNearCityWeather();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
        private void GetNearCityWeather()
        {
            HttpContext context = HttpContext.Current;
            NearCityWeatherManager gControllerManager = new NearCityWeatherManager();
            DataTable dt = gControllerManager.GetNearCityWeather();
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
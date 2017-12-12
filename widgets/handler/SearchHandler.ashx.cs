using HJJC.BLL;
using System.Data;
using System.Text;
using System.Web;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// SearchHandler 的摘要说明
    /// </summary>
    public class SearchHandler : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];

            switch (methodName)
            {
                case "GetAllSearch":
                    {
                        GetAllSearch();
                        break;
                    }

                default:
                    {
                        break;
                    }
            }
        }

        private void GetAllSearch()
        {
            HttpContext context = HttpContext.Current;
            string strCon = context.Request.Params["strCon"];

            SearchManager SearchManager = new SearchManager();
            DataTable dt = SearchManager.GetAllSearch(strCon);
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
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
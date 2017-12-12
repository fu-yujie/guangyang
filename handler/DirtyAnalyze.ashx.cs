using HJJC.BLL;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// BusinessaAnalysis 的摘要说明
    /// </summary>
    public class DirtyAnalyze : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetDirtyAnalyze":
                    {
                        GetDirtyAnalyze();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        private void GetDirtyAnalyze()
        {
            HttpContext context = HttpContext.Current;
            string where = context.Request.Params["where"];
            // where = "三区,二区";
            string[] strs = where.Split(',');
            var query = strs.Aggregate(string.Empty, (current, s) => current + ("'" + s + "',"));
            query = query.Substring(0, query.LastIndexOf(','));//  '一区','二区'
            
            var dirtyAnalyzeManager = new DirtyAnalyzeManager();
            DataTable dt = dirtyAnalyzeManager.GetDirtyAnalyze(query);
            DataTable dtTable = dirtyAnalyzeManager.GetDirtyCoordinate(query);

            var sb = new StringBuilder(("{"));
            sb.Append("'count':[");
            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    sb.Append("{");
                    sb.Append($@"'totalNum':'{row["totalNum"]}',");
                    sb.Append($@"'IndustryCode':'{row["IndustryCode"]}',");
                    sb.Append($@"'IndustryName':'{row["IndustryName"]}'");
                    sb.Append("},");
                }
                sb = sb.Remove(sb.Length - 1, 1);
            }
            sb.Append("],'rows':[");
            if (dtTable != null && dtTable.Rows.Count > 0)
            {
                foreach (DataRow drow in dtTable.Rows)
                {
                    sb.Append("{");
                    sb.Append($@"'longitude':'{drow["Longitude"]}',");
                    sb.Append($@"'latitude':'{drow["Latitude"]}',");
                    sb.Append($@"'industryCode':'{drow["Industry"]}'");
                    sb.Append("},");
                }
                sb = sb.Remove(sb.Length - 1, 1);
            }
            sb.Append("]");
            sb.Append("}");
            sb = sb.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(sb.ToString());

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
        public bool IsReusable => false;
    }
}
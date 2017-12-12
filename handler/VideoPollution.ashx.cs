using System.Web;
using System.Text;
using System.Data;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// VideoPollution 的摘要说明
    /// </summary>
    public class VideoPollution : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllVideoAreas":
                    {
                        GetAllVideoAreas();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
        private void GetAllVideoAreas()
        {
            HttpContext context = HttpContext.Current;
            VideoPollutionManager videoPollutionManager = new VideoPollutionManager();
            DataTable dt = videoPollutionManager.GetAllVideoAreaList();
            StringBuilder sb = new StringBuilder("[");
            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow dr in dt.Rows)
                {
                    sb.Append("{");
                    sb.Append($@"'name':'{dr["Name"]}',");
                    sb.Append($@"'longitude':'{dr["lon"]}',");
                    sb.Append($@"'latitude':'{dr["lat"]}'");
                    sb.Append("},");
                }
                sb = sb.Remove(sb.Length - 1, 1);
            }
            sb.Append("]");
            sb = sb.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(sb.ToString());
        }
        public bool IsReusable => false;
    }
}
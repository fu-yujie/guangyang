using System.Web;
using System.Text;
using System.Data;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// SitePollution 的摘要说明
    /// </summary>
    public class SitePollution : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllSiteAreas":
                    {
                        GetAllSiteAreas();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
        private void GetAllSiteAreas()
        {
            HttpContext context = HttpContext.Current;
            SitePollutionManager sitePollutionManager = new SitePollutionManager();
            DataTable dt = sitePollutionManager.GetSiteInfoAll("104");
            StringBuilder sb = new StringBuilder("[");
            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow dr in dt.Rows)
                {
                    sb.Append("{");
                    sb.Append(
                        $@"'编码':'{dr["Code"]}','经度':'{dr["longitude"]}','纬度':'{dr["latitude"]}','名称':'{dr["Name"]}','地址':'{dr
                            ["Address"]}','联系人':'{dr["Contacts"]}','联系方式':'{dr["Contactinformation"]}','管控措施':'{dr[
                                "cuoshi"]}'/*,'图片':'{dr["PicUrl"]}'*/");
                    sb.Append("},");
                }
                sb = sb.Remove(sb.Length - 1, 1);
            }
            sb.Append("]");
            context.Response.Write(sb.ToString().Trim().Replace("\n", "").Replace("\r\n", ""));
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
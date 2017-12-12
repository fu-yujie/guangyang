using System.Web;
using System.Text;
using System.Data;
using HJJC.BLL;
namespace HJJC.widgets.handler
{
    /// <summary>
    /// SewagePollution 的摘要说明
    /// </summary>
    public class SewagePollution : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllSewageAreas":
                    {
                        GetAllSewageAreas();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        private void GetAllSewageAreas()
        {
            HttpContext context = HttpContext.Current;
            SewagePollutionManager sewagePollutionManager = new SewagePollutionManager();
            DataTable dt = sewagePollutionManager.GetSewageInfoArryList("106");
            StringBuilder sb = new StringBuilder("[");
            foreach (DataRow dr in dt.Rows)
            {
                sb.Append("{");
                sb.Append(
                    $@"'编码':'{dr["Code"]}','经度':'{dr["longitude"]}','纬度':'{dr["latitude"]}','名称':'{dr["Name"]}','地址':'{dr
                        ["Address"]}','联系人':'{dr["Contacts"]}','联系方式':'{dr["Contactinformation"]}'/*,'图片':'{dr["PicUrl"]}'*/");
                sb.Append("},");
            }
            sb = sb.Remove(sb.Length - 1, 1);
            sb.Append("]");
            sb = sb.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(sb.ToString());
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
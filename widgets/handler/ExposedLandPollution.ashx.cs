using System.Web;
using System.Text;
using System.Data;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// ExposedLandPollution 的摘要说明
    /// </summary>
    public class ExposedLandPollution : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllExposedLandAreas":
                    {
                        GetAllExposedLandAreas();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        private void GetAllExposedLandAreas()
        {
            HttpContext context = HttpContext.Current;
            ExposedLandPollutionManager ExposedLand = new ExposedLandPollutionManager();
            DataTable dt = ExposedLand.GetAllExposedLandAreaList("108");

            StringBuilder sb = new StringBuilder("[");
            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow dr in dt.Rows)
                {
                    sb.Append("{");
                    sb.Append(
                        $@"'编码':'{dr["Code"].ToString().Trim()}','名称':'{dr["Name"].ToString().Trim()}','地址':'{dr[
                            "Address"].ToString().Trim()}','联系人':'{dr["Contacts"].ToString().Trim()}','联系方式':'{dr[
                                "Contactinformation"].ToString().Trim()}','防风抑尘措施':'{dr["cuoshi"].ToString().Trim()}','经度':'{dr
                                    ["longitude"].ToString().Trim()}','纬度':'{dr["latitude"].ToString().Trim()}'/*,'图片':'{dr["PicUrl"].ToString().Trim()}'*/");
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
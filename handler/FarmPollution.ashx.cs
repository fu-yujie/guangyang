using System.Data;
using System.Text;
using System.Web;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// 养殖场 的摘要说明 code=103
    /// </summary>
    public class FarmPollution : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllFarm":
                    {
                        GetAllFarm();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
        private void GetAllFarm()
        {
            HttpContext context = HttpContext.Current;
            var farmPollutionManager = new FarmPollutionManager();
            DataTable dt = farmPollutionManager.GetAllFarmAll("103");
            StringBuilder sb = new StringBuilder("[");
            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow dr in dt.Rows)
                {
                    sb.Append("{");
                    sb.Append(
                        $@"'编码':'{dr["Code"]}','名称':'{dr["Name"]}','地址':'{dr["Address"]}','联系人':'{dr["Contacts"]}','联系方式':'{dr
                            ["Contactinformation"]}','是否远离水源':'{dr["cuoshi"]}','经度':'{dr["longitude"]}','纬度':'{dr[
                                "latitude"]}'/*,'图片':'{dr["PicUrl"]}'*/");
                    sb.Append("},");
                }
                sb.Remove(sb.Length - 1, 1);
            }
            sb.Append("]");
            sb = sb.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(sb.ToString());
        }
        public bool IsReusable => false;
    }
}
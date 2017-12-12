using System.Web;
using System.Text;
using System.Data;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// 煤经销点 的摘要说明
    /// </summary>
    public class CoalPollution : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllCoalAreas":
                    {
                        GetAllCoalAreas();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
        private void GetAllCoalAreas()
        {
            HttpContext context = HttpContext.Current;
            CoalPollutionManager coalPollutionManager = new CoalPollutionManager();
            DataTable dt = coalPollutionManager.GetAllCoalAreaList("105");
            StringBuilder sb = new StringBuilder("[");
            if(dt!=null && dt.Rows.Count > 0)
            {
                foreach (DataRow item in dt.Rows)
                {
                    sb.Append("{");
                    sb.Append(
                        $@"'编码':'{item["Code"]}','名称':'{item["Name"]}','地址':'{item["Address"]}','联系人':'{item["Contacts"]}'
                    ,'联系方式':'{item
                            ["Contactinformation"]}','经度':'{item["Longitude"]}','纬度':'{item["Latitude"]}'/*,'图片':'{item["PicUrl"]}'*/");
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
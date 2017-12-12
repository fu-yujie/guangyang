using HJJC.BLL;
using System.Data;
using System.Text;
using System.Web;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// RoadPollution 的摘要说明
    /// </summary>
    public class RoadPollution : IHttpHandler
    {
        private RoadPollutionManager roadPollutionManager;
        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetRoadInfoByRoadCode":
                    {
                        GetRoadInfoArryList();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        private void GetRoadInfoArryList()
        {
            
            HttpContext context = HttpContext.Current;
            roadPollutionManager = new RoadPollutionManager();
            DataTable dt = roadPollutionManager.GetRoadInfoArryList("107");
            StringBuilder sb = new StringBuilder("[");
            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow dr in dt.Rows)
                {
                    sb.Append("{");
                    sb.Append(
                        $@"'编码':'{dr["MainCode"]}','名称':'{dr["Name"]}','地址':'{dr["Address"]}','清扫联系人':'{dr["Contacts"]}','联系方式':'{dr
                            ["Contactinformation"]}'/*,'图片':'{dr["PicUrl"]}'*/");
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
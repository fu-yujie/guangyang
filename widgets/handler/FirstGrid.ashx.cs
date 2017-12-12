using System.Configuration;
using System.Web;
using HJJC.BLL;
using System.Data;
using System.Text;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// FirstGrid 的摘要说明
    /// </summary>
    public class FirstGrid : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetPollutionQuality":
                    {
                        GetPollutionQuality();
                        break;
                    }
                case "GetGridInfo":
                    {
                        GetGridInfo();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
        private void GetPollutionQuality()
        {
            HttpContext context = HttpContext.Current;
            StringBuilder sb = new StringBuilder("{");
            FirstGridManagerManager firstGridManager = new FirstGridManagerManager();
            var gridCode = ConfigurationManager.AppSettings["GridCode"];
            DataTable dt = firstGridManager.GetPollutionQuality($"GridCode in('{gridCode}')");

            if (dt.Rows.Count > 0)
            {
                foreach (DataRow dr in dt.Rows)
                {
                    sb.Append($"{dr["gridCode"]}:");
                    sb.Append("{");
                    sb.Append(
                        $@"color:'{dr["color"]}',gridName:'{dr["gridName"]}',quality:'{dr["quality"]}',AQI:'{dr["AQI"]}',PM10:'{dr["PM10"]}'
                        ,PM25:'{dr["PM25"]}',SO2:'{dr["SO2"]}',CO:'{dr["CO"]}',NO2:'{dr["NO2"]}',O3:'{dr["O3"]}'");
                    sb.Append("},");
                }
            }
            sb = sb.Remove(sb.Length - 1, 1);
            sb.Replace("\r\n", "").Replace("\n", "");
            sb.Append("}");
            context.Response.Write(sb.ToString());
        }

        private void GetGridInfo()
        {
            HttpContext context = HttpContext.Current;
            string gridCode = context.Request.Params["gridCode"];
            StringBuilder sb = new StringBuilder("{");
            FirstGridManagerManager firstGridManager = new FirstGridManagerManager();
            DataTable dtInfo = firstGridManager.GetGridInfoByGridCode(gridCode);
            DataTable dtLeader = firstGridManager.GetGridLeaderByGridCode(gridCode);
            DataTable dtUser = firstGridManager.GetGridUserByGridCode(gridCode);
            DataTable dtCount = firstGridManager.GetGridCountByGridCode(gridCode);

            sb.Append("gridInfo:{");
            if (dtInfo.Rows.Count > 0)
            {
                sb.Append($@"'网格编号':'{dtInfo.Rows[0]["gridCode"]}','区域名称':'{dtInfo.Rows[0]["gridName"]}','网格区域':'{dtInfo.Rows[0]["gridDiction"]}',");
                if (dtLeader.Rows.Count > 0)
                {
                    sb.Append($@"'网格长':'{dtLeader.Rows[0]["leaderName"]}','联系方式':'{dtLeader.Rows[0]["ContactNumber"]}',");
                }
                if (dtCount.Rows.Count > 0)
                {
                    sb.Append($@"'二级网格数量':'{dtCount.Rows[0]["secondGridCount"]}','二级网格巡查员':'{dtCount.Rows[0]["secondUserCount"]}'
                    ,'三级网格数量':'{dtCount.Rows[0]["thirdGridCount"]}','三级网格巡查员':'{dtCount.Rows[0]["thirdUserCount"]}','污染源数量':'{dtCount.Rows[0]["pollutionCount"]}',");
                }
                sb = sb.Remove(sb.Length - 1, 1);
            }
            sb.Append("},userList:{");
            if (dtUser.Rows.Count > 0)
            {
                foreach (DataRow dr in dtUser.Rows)
                {
                    sb.Append($@"'{dr["userName"]}':'{dr["contactNumber"]}',");
                }
                sb = sb.Remove(sb.Length - 1, 1);
            }
            sb.Append("}}");
            context.Response.Write(sb.ToString());
        }

        public bool IsReusable => false;
    }
}
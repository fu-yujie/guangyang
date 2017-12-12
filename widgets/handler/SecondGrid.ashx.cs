using HJJC.BLL;
using System.Data;
using System.Text;
using System.Web;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// SecondGrid 的摘要说明
    /// </summary>
    public class SecondGrid : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
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
        private void GetGridInfo()
        {
            HttpContext context = HttpContext.Current;
            string gridCode = context.Request.Params["gridCode"];
            StringBuilder sb = new StringBuilder("{");
            SecondGridManager secondGridManager = new SecondGridManager();
            DataTable dtInfo = secondGridManager.GetGridInfoByGridCode(gridCode);
            DataTable dtLeader = secondGridManager.GetGridLeaderByGridCode(gridCode);
            DataTable dtUser = secondGridManager.GetGridUserByGridCode(gridCode);
            DataTable dtCount = secondGridManager.GetGridCountByGridCode(gridCode);

            sb.Append("gridInfo:{");
            if (dtInfo.Rows.Count > 0)
            {
                sb.Append(
                    $@"'网格编号':'{dtInfo.Rows[0]["gridCode"]}','区域名称':'{dtInfo.Rows[0]["gridName"]}','网格区域':'{dtInfo.Rows[0]["gridDiction"]}',");
                if (dtLeader.Rows.Count > 0)
                {
                    sb.Append(
                        $@"'网格长':'{dtLeader.Rows[0]["leaderName"]}','联系方式':'{dtLeader.Rows[0]["ContactNumber"]}',");
                }
                if (dtCount.Rows.Count > 0)
                {
                    sb.Append(
                        $@"'三级网格数量':'{dtCount.Rows[0]["thirdGridCount"]}','三级网格巡查员':'{dtCount.Rows[0]["thirdUserCount"]}','污染源数量':'{dtCount.Rows[0]["pollutionCount"]}',");
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
            sb.Replace("\r\n", "").Replace("\n", "");
            context.Response.Write(sb.ToString());
        }

        public bool IsReusable => false;
    }
}
using HJJC.BLL;
using System;
using System.Data;
using System.Text;
using System.Web;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// BoilerPollution 的摘要说明
    /// </summary>
    public class BoilerPollution : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllBoilerAreas":
                    {
                        GetAllBoilerAreas();
                        break;
                    }

                default:
                    {
                        break;
                    }
            }
        }
        private void GetAllBoilerAreas()
        {
            HttpContext context = HttpContext.Current;
            string typeCode = "102";
            BoilerPollutionManager boilerPollutionManager = new BoilerPollutionManager();
            DataTable dtBase = boilerPollutionManager.GetAllBoilerAreaList(typeCode);
            DataTable dtBoil = boilerPollutionManager.GetDetail();
            try
            {
                StringBuilder sb = new StringBuilder("{\"msg\":\"ok\"");
                if (dtBase != null && dtBase.Rows.Count > 0)
                {
                    sb.Append(",\"items\":[");
                    foreach (DataRow item in dtBase.Rows)
                    {
                        sb.Append("{");
                        sb.Append($"\"编码\":\"{item["Code"]}\",");
                        sb.Append($"\"名称\":\"{item["Name"]}\",");
                        sb.Append($"\"地址\":\"{item["Address"]}\",");
                        sb.Append($"\"联系人\":\"{item["Contacts"]}\",");
                        sb.Append($"\"经度\":\"{item["Longitude"]}\",");
                        sb.Append($"\"纬度\":\"{item["Latitude"]}\",");
                        sb.Append($"\"联系方式\":\"{item["Contactinformation"]}\"");
                        //sb.Append($"\"图片\":\"{item["PicUrl"]}\"");
                        DataRow[] dtDetail = dtBoil.Select($"MainCode='{item["Code"]}'");
                        if (dtDetail != null && dtDetail.Length > 0)
                        {
                            sb.Append(",\"rows\":[");
                            foreach (DataRow dr in dtDetail)
                            {
                                sb.Append("{");
                                sb.Append($"\"锅炉型号\":\"{dr["Type"]}\",");
                                sb.Append($"\"锅炉规模(蒸吨/小时)\":\"{dr["GuIMo"]}\",");
                                sb.Append($"\"锅炉用途（生产/取暖/茶炉/浴炉）\":\"{dr["YongTu"]}\",");
                                sb.Append($"\"淘汰方式\":\"{dr["TaoTai"]}\",");
                                sb.Append($"\"是否改造\":\"{dr["IsGaiZao"]}\"");
                                sb.Append("},");
                            }
                            sb = sb.Remove(sb.Length - 1, 1);
                            sb.Append("]");
                        }
                        sb.Append("},");
                    }
                    sb = sb.Remove(sb.Length - 1, 1);
                    sb.Append("]");
                }
                sb.Append("}");
                sb = sb.Replace("\n", "").Replace("\r\n", "");
                context.Response.Write(sb.ToString());
            }
            catch (Exception ex)
            {
                context.Response.Write(string.Format("{\"msg\":\"error\"}"));
            }
        }

        public bool IsReusable => false;
    }
}
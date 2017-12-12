using System.Data;
using System.Text;
using System.Web;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// CompanyPollution 的摘要说明
    /// </summary>
    public class CompanyPollution : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllCompnayAreas":
                    {
                        GetAllCompnayAreas();
                        break;
                    }
                case "GetAllOther":
                    {
                        GetAllOther(context);
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }

        private void GetAllOther(HttpContext context)
        {
            string companyCode = context.Request.Params["mainCode"];
            string companyName = context.Request.Params["name"];
            var type = companyCode?.Substring(0, 3);
            var companyPollutionManager = new CompanyPollutionManager();
            DataTable dtAir, dtWf, dtWater;
            DataRow drAir = null, drWf = null, drWater = null;
            switch (type)
            {
                case "110"://水
                    dtAir = companyPollutionManager.GetOtherAir(companyName);
                    dtWf = companyPollutionManager.GetOtherWf(companyName);
                    if (dtAir?.Rows != null && dtAir.Rows.Count > 0)
                        drAir = dtAir.Rows[0];
                    if (dtWf?.Rows != null && dtWf.Rows.Count > 0)
                        drWf = dtWf.Rows[0];
                    break;
                case "111"://气
                    dtWater = companyPollutionManager.GetOtherShui(companyName);
                    dtWf = companyPollutionManager.GetOtherWf(companyName);
                    if (dtWater?.Rows != null && dtWater.Rows.Count > 0)
                        drWater = dtWater.Rows[0];
                    if (dtWf?.Rows != null && dtWf.Rows.Count > 0)
                        drWf = dtWf.Rows[0];
                    break;
                case "112"://危废
                    dtWater = companyPollutionManager.GetOtherShui(companyName);
                    dtAir = companyPollutionManager.GetOtherAir(companyName);
                    if (dtWater?.Rows != null && dtWater.Rows.Count > 0)
                        drWater = dtWater.Rows[0];
                    if (dtAir?.Rows != null && dtAir.Rows.Count > 0)
                        drAir = dtAir.Rows[0];
                    break;
                case "113"://金属
                    dtWf = companyPollutionManager.GetOtherWf(companyName);
                    dtWater = companyPollutionManager.GetOtherShui(companyName);
                    dtAir = companyPollutionManager.GetOtherAir(companyName);
                    if (dtAir?.Rows != null && dtAir.Rows.Count > 0)
                        drAir = dtAir.Rows[0];
                    if (dtWater?.Rows != null && dtWater.Rows.Count > 0)
                        drWater = dtWater.Rows[0];
                    if (dtWf?.Rows != null && dtWf.Rows.Count > 0)
                        drWf = dtWf.Rows[0];
                    break;
            }
            var sb = new StringBuilder("{");
            if (drAir != null)
            {
                sb.Append("\"AirCompany\":{");
                sb.Append($"\"GongYeCount\":\"{drAir["GongYeCount"]}\",\"ZhiLiCount\":\"{drAir["ZhiLiCount"]}\",\"企业类型\":\"涉气企业\"");
                sb.Append("}");
            }

            if (drWater != null && sb.ToString() != "{")
            {
                sb.Append(",\"WaterCompany\":{");
                sb.Append($"\"ZhiLiCount\":\"{drWater["ZhiLiCount"]}\",\"PaiFangLiang\":\"{drWater["PaiFangLiang"]}\",\"ChiShiChuLi\":\"{drWater["ChiShiChuLi"]}\",\"企业类型\":\"涉水企业\"");
                sb.Append("}");
            }
            else if (drWater != null && sb.ToString() == "{")
            {
                sb.Append("\"WaterCompany\":{");
                sb.Append($"\"ZhiLiCount\":\"{drWater["ZhiLiCount"]}\",\"PaiFangLiang\":\"{drWater["PaiFangLiang"]}\",\"ChiShiChuLi\":\"{drWater["ChiShiChuLi"]}\",\"企业类型\":\"涉水企业\"");
                sb.Append("}");
            }

            if (drWf != null && sb.ToString() != "{")
            {
                sb.Append(",\"WfCompany\":{");
                sb.Append(
                    $"\"WfChanSheng\":\"{drWf["WfChanSheng"]}\",\"WfChuZhi\":\"{drWf["WfChuZhi"]}\",\"企业类型\":\"涉危废企业\"");
                sb.Append("}");
            }
            else if (drWf != null && sb.ToString() == "{")
            {
                sb.Append("\"WfCompany\":{");
                sb.Append(
                    $"\"WfChanSheng\":\"{drWf["WfChanSheng"]}\",\"WfChuZhi\":\"{drWf["WfChuZhi"]}\",\"企业类型\":\"涉危废企业\"");
                sb.Append("}");
            }
            sb.Append("}");
            sb = sb.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(sb.ToString());
        }

        private void GetAllCompnayAreas()
        {
            HttpContext context = HttpContext.Current;
            CompanyPollutionManager companyPollutionManager = new CompanyPollutionManager();
            DataTable dtAir = companyPollutionManager.GetAllAirAreaList("111");
            DataTable dtWater = companyPollutionManager.GetAllWaterAreaList("110");
            DataTable dtWf = companyPollutionManager.GetAllWfAreaList("112");
            DataTable dtJinshu = companyPollutionManager.GetAllJinshuAreaList("113");
            StringBuilder sb = new StringBuilder("{");
            if (dtAir != null && dtAir.Rows.Count > 0)//涉气企业
            {
                sb.Append("\"AirCompany\":[");
                foreach (DataRow item in dtAir.Rows)
                {
                    sb.Append("{");
                    sb.Append(
                        $@"'编码':'{item["Code"]}','名称':'{item["Name"]}','地址':'{item["Address"]}','联系人':'{item["Contacts"]}'
                    ,'联系方式':'{item
                            ["Contactinformation"]}','经度':'{item["Longitude"]}','纬度':'{item["Latitude"]}','所属网格':'{item[
                                "GridName"]}','工业废气排放量（万立方米）':'{item["GongYeCount"]}','废气治理设施数（套）':'{item["ZhiLiCount"]}','企业类型':'涉气企业'/*,'图片':'{item["PicUrl"]}'*/,'其他属性':'{item["button"]}'");
                    sb.Append("},");
                }
                sb = sb.Remove(sb.Length - 1, 1);
                sb.Append("]");
            }
            if (dtJinshu != null && dtJinshu.Rows.Count > 0)//涉金属企业
            {
                sb.Append(",\"Jinshu\":[");
                foreach (DataRow item in dtJinshu.Rows)
                {
                    sb.Append("{");
                    sb.Append(
                        $@"'编码':'{item["Code"]}','名称':'{item["Name"]}','地址':'{item["Address"]}','联系人':'{item["Contacts"]}'
                    ,'联系方式':'{item
                            ["Contactinformation"]}','经度':'{item["Longitude"]}','纬度':'{item["Latitude"]}','所属网格':'{item[
                                "GridName"]}','企业类型':'涉重金属企业'/*,'所属网格':'{item["PicUrl"]}'*/,'其他属性':'{item["button"]}'");
                    sb.Append("},");
                }
                sb = sb.Remove(sb.Length - 1, 1);
                sb.Append("]");
            }
            if (dtWater != null && dtWater.Rows.Count > 0)//涉水企业
            {
                sb.Append(",\"Water\":[");
                foreach (DataRow item in dtWater.Rows)
                {
                    sb.Append("{");
                    sb.Append(
                        $@"'编码':'{item["Code"]}','名称':'{item["Name"]}','地址':'{item["Address"]}','联系人':'{item["Contacts"]}'
                    ,'联系方式':'{item
                            ["Contactinformation"]}','经度':'{item["Longitude"]}','纬度':'{item["Latitude"]}','所属网格':'{item[
                                "GridName"]}','废水治理设施数（套）':'{item["ZhiLiCount"]}',
                    '工业废水排放量（吨）':'{item
                                    ["PaiFangLiang"]}','其中：排入城市污水处理厂的（吨）':'{item["ChiShiChuLi"]}','企业类型':'涉水企业'/*,'图片':'{item["PicUrl"]}'*/,'其他属性':'{item["button"]}'");
                    sb.Append("},");
                }
                sb = sb.Remove(sb.Length - 1, 1);
                sb.Append("]");
            }
            if (dtWf != null && dtWf.Rows.Count > 0)//涉危废企业
            {
                sb.Append(",\"WfCompany\":[");
                foreach (DataRow item in dtWf.Rows)
                {
                    sb.Append("{");
                    sb.Append(
                        $@"'编码':'{item["Code"]}','名称':'{item["Name"]}','地址':'{item["Address"]}','联系人':'{item["Contacts"]}'
                    ,'联系方式':'{item
                            ["Contactinformation"]}','经度':'{item["Longitude"]}','纬度':'{item["Latitude"]}','所属网格':'{item[
                                "GridName"]}','危险废物产生量（吨）':'{item["WfChanSheng"]}','危险废物处置量（吨）':'{item["WfChuZhi"]}','企业类型':'涉危废企业'/*,'图片':'{item["PicUrl"]}'*/,'其他属性':'{item["button"]}'");
                    sb.Append("},");
                }
                sb = sb.Remove(sb.Length - 1, 1);
                sb.Append("]");
            }
            sb.Append("}");
            sb = sb.Replace("\n", "");
            sb = sb.Replace("\r\n", "");
            sb = sb.Replace(" ", "");
            context.Response.Write(sb.ToString());
        }

        public bool IsReusable => false;
    }
}
using System;
using System.Linq;
using System.Web;
using System.Text;
using System.Data;
using HJJC.BLL;
using System.Configuration;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// CaseInfo 的摘要说明
    /// </summary>
    public class CaseInfo : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllCaseAreas":
                    {
                        GetAllCaseAreas();
                        break;
                    }
                case "GetCaseType":
                    {
                        GetCaseType();
                        break;
                    }
                case "GetCaseStatus":
                    {
                        GetCaseStatus();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
        private void GetAllCaseAreas()
        {
            HttpContext context = HttpContext.Current;
            CaseInfoManager caseInfoManager = new CaseInfoManager();
            string where = context.Request.Params["where"];
            DataTable dt = caseInfoManager.GetCaseByWhere(where);
            string pictureRootPath = ConfigurationManager.AppSettings["PictureRootPath"];
            string pictureRootPathWeb = ConfigurationManager.AppSettings["PictureRootPathWeb"];
            string id = string.Empty;
            StringBuilder sb = new StringBuilder("[");
            if (dt != null && dt.Rows.Count > 0)
            {
                id = dt.Rows.Cast<DataRow>().Aggregate(id, (current, item) => current + ("'" + item["t_EventOID"] + "',"));
                id = id.Remove(id.Length - 1, 1);

                DataTable dtAllAccessory = caseInfoManager.GetAccessoryById(id);//根据id获取图片

                foreach (DataRow item in dt.Rows)
                {
                    DataRow[] drAqPicPath = dtAllAccessory.Select($"Belongto='{item["t_EventOID"]}' and AccessoryTypeCode='0101'");
                    DataRow[] drAhPicPath = dtAllAccessory.Select($"Belongto='{item["t_EventOID"]}' and AccessoryTypeCode='0102'");
                    StringBuilder aqUrl = new StringBuilder();
                    StringBuilder ahUrl = new StringBuilder();
                    if (drAqPicPath != null && drAqPicPath.Count() > 0)
                    {
                        aqUrl = GetPicUrl(pictureRootPath, drAqPicPath, aqUrl);
                    }
                    else
                    {
                        aqUrl = aqUrl.Append("[{\"pic\":\"" + pictureRootPathWeb + "widgets/assets/images/nullPicture.png\"}]");
                    }
                    if (drAhPicPath != null && drAhPicPath.Count() > 0)
                    {
                        ahUrl = GetPicUrl(pictureRootPath, drAhPicPath, ahUrl);
                    }
                    else
                    {
                        ahUrl = ahUrl.Append("[{\"pic\":\"" + pictureRootPathWeb + "widgets/assets/images/nullPicture.png\"}]");
                    }

                    sb.Append("{");
                    sb.Append(
                        $"\"EventId\":\"{item["EventId"]}\",\"Longitude\":\"{item["Longitude"]}\",\"Latitude\":\"{item["Latitude"]}\",\"Description\":\"{item["Description"]}\",\"Location\":\"{item["Location"]}\",\"RecordingTime\":\"{item["RecordingTime"]}\",\"EventTypeName\":\"{item["EventTypeName"]}\",\"StatusName\":\"{item["StatusName"]}\",\"Author\":\"{item["Author"]}\",\"LevelName\":\"{item["LevelName"]}\",\"ThirdGridName\":\"{item["ThirdGridName"]}\",\"SecondGridName\":\"{item["SecondGridName"]}\",\"OneResult\":\"{item["OneResult"]}\",\"OneOpinion\":\"{item["OneOpinion"]}\",\"OneTime\":\"{item["OneTime"]}\",\"TwoResult\":\"{item["TwoResult"]}\",\"TwoTime\":\"{item["TwoTime"]}\",\"Remarks\":\"{item["Remarks"]}\",\"aqUrl\":{aqUrl},\"ahUrl\":{ahUrl}");
                    sb.Append("},");

                }
                sb.Remove(sb.Length - 1, 1);
                sb = sb.Replace("\r\n", "").Replace("\n", "").Replace("\r\n", "").Replace(Environment.NewLine, "");
            }
            sb.Append("]");

            context.Response.Write(sb.ToString());
        }

        private static StringBuilder GetPicUrl(string picRootUrl, DataRow[] drPicPath, StringBuilder picUrl)
        {
            picUrl.Append("[");
            foreach (DataRow item in drPicPath)
            {
                picUrl.Append("{");
                picUrl.Append($"\"pic\":\"{picRootUrl + item["DestFile"].ToString().Replace("\\", "/") + "/" + item["SourceName"]}\"");
                picUrl.Append("},");
            }
            picUrl = picUrl.Remove(picUrl.Length - 1, 1);
            picUrl.Append("]");
            return picUrl;
        }


        private void GetCaseType()
        {
            HttpContext context = HttpContext.Current;
            CaseInfoManager caseInfoManager = new CaseInfoManager();
            DataTable dt = caseInfoManager.GetCaseType();
            StringBuilder sb = new StringBuilder("[");
            foreach (DataRow dr in dt.Rows)
            {
                sb.Append("{");
                sb.Append($@"id:'{dr["Code"]}',");
                sb.Append($@"label:'{dr["Name"]}'");
                sb.Append("},");
            }
            sb.Append("{id:'all',label:'全部'}]");
            context.Response.Write(sb.ToString().Trim().Replace("\n", "").Replace("\r\n", ""));
        }
        public bool IsReusable => false;

        private void GetCaseStatus()
        {
            HttpContext context = HttpContext.Current;
            CaseInfoManager caseInfoManager = new CaseInfoManager();
            DataTable dt = caseInfoManager.GetCaseStatus();
            StringBuilder sb = new StringBuilder("[");
            foreach (DataRow dr in dt.Rows)
            {
                sb.Append("{");
                sb.Append($@"id:'{dr["Code"]}',");
                sb.Append($@"name:'{dr["Name"]}'");
                sb.Append("},");
            }
            sb.Append("{id:'all',name:'全部'}]");
            context.Response.Write(sb.ToString().Trim().Replace("\n", "").Replace("\r\n", ""));
        }
    }
}
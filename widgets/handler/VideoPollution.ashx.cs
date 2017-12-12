using System;
using System.Web;
using System.Text;
using System.Data;
using HJJC.BLL;
using Newtonsoft.Json;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// VideoPollution 的摘要说明
    /// </summary>
    public class VideoPollution : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "GetAllVideoAreas":
                    {
                        GetAllVideoAreas();
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
        private void GetAllVideoAreas()
        {
            HttpContext context = HttpContext.Current;
            var name = context.Request.Params["name"];
            int type, status;
            int.TryParse(context.Request.Params["type"], out type);
            int.TryParse(context.Request.Params["state"], out status);
            VideoPollutionManager videoPollutionManager = new VideoPollutionManager();
            DataTable dt = videoPollutionManager.GetAllVideoAreaList(name, type, status);
            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow dataRow in dt.Rows)
                {
                    if (dataRow["status"].ToString() == "0")
                    {
                        //dataRow["status2"] = "<img src='/widgets/assets/images/camera.png' />";
                        dataRow["status2"] = @"<div style=' width: 10px;
                        height: 10px;
                        background-color: #9DF94B;
                        border-radius: 50%;
                        -moz-border-radius: 50%;
                        -webkit-border-radius: 50%; '></div>";
                    }
                    else
                    {
                        dataRow["status2"] = @"<div style=' width: 10px;
                        height: 10px;
                        background-color: red;
                        border-radius: 50%;
                        -moz-border-radius: 50%;
                        -webkit-border-radius: 50%; '></div>";
                    }
                }
            }
            var jsonData = JsonConvert.SerializeObject(dt);
            context.Response.Write(jsonData.Replace("\r", "").Replace("\n", "").Replace("\r\n", "").Replace(Environment.NewLine, ""));
        }
        public bool IsReusable => false;
    }
}
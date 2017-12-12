using System.Data;
using System.Text;
using System.Web;
using System.Web.SessionState;
using HJJC.BLL;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// Index 的摘要说明
    /// </summary>
    public class Index : IHttpHandler, IRequiresSessionState
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            string methodName = context.Request.Params["methodName"];
            switch (methodName)
            {
                case "Login":
                    {
                        Login(context);
                        break;
                    }
                case "GetQX":
                    {
                        GetQX(context);
                        break;
                    }

                default:
                    {
                        break;
                    }
            }
        }

        private void GetQX(HttpContext context)
        {
            string orgName = context.Request.Params["name"];
            IndexManage im = new IndexManage();
            DataTable dt = im.GetQx(orgName);
            StringBuilder data = new StringBuilder("{\"data\":\"0\"}");
            if (dt != null && dt.Rows.Count > 0)
            {
                data = new StringBuilder("{");
                data.Append("\"data\":\"1\",");
                data.Append($"\"DepartName\":\"{orgName}\",");
                data.Append("\"Rows\":");
                data.Append(Service.Common.DataTableToJson(dt));
                data.Append("}");
            }
            data = data.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(data);
        }

        private void Login(HttpContext context)
        {
            string userName = context.Request.Params["name"];
            string pwd = context.Request.Params["password"];
            string orgName = context.Request.Params["dapart"];
            // Common.DEncrypt.EncryptRe a = new Common.DEncrypt.EncryptRe();
            BLL.IndexManage index = new BLL.IndexManage();
            //System.Data.DataTable dt = index.Login(userName, a.EncryptString(Pwd), orgName);
            DataTable dt = index.Login(userName, MD5(pwd), orgName);
            StringBuilder sb = new StringBuilder("{\"data\":\"0\"}");
            if (dt != null && dt.Rows.Count > 0)

            {
                context.Session["userId"] = dt.Rows[0][0];
                sb = new StringBuilder("{");
                sb.Append("\"data\":\"1\",");
                sb.Append($"\"DepartName\":\"{orgName}\"");
                switch (orgName)
                {
                    case "环保局":
                    case "耀华道办事处":
                    case "云鹏道办事处":
                        sb.Append(",\"Rows\":[");
                        sb.Append("{\"IndustryCode\": \"101\",\"IndustryName\": \"餐饮\"},");
                        sb.Append("{\"IndustryCode\": \"102\",\"IndustryName\": \"锅炉\"},");
                        sb.Append("{\"IndustryCode\": \"103\",\"IndustryName\": \"养殖场\"},");
                        sb.Append("{\"IndustryCode\": \"104\",\"IndustryName\": \"建筑工地\"},");
                        sb.Append("{\"IndustryCode\": \"105\",\"IndustryName\": \"煤经销点\"},");
                        sb.Append("{\"IndustryCode\": \"106\",\"IndustryName\": \"污水排放口\"},");
                        sb.Append("{\"IndustryCode\": \"107\",\"IndustryName\": \"道路\"},");
                        sb.Append("{\"IndustryCode\": \"108\",\"IndustryName\": \"料土堆\"},");
                        sb.Append("{\"IndustryCode\": \"110\",\"IndustryName\": \"渣土车\"},");
                        sb.Append("{\"IndustryCode\": \"109\",\"IndustryName\": \"污染企业\"}");
                        sb.Append("]");
                        break;
                    case "市场监督管理局":
                        sb.Append(",\"Rows\":[");
                        sb.Append("{\"IndustryCode\": \"105\",\"IndustryName\": \"煤经销点\"},");
                        sb.Append("{\"IndustryCode\": \"101\",\"IndustryName\": \"餐饮\"}");
                        sb.Append("]");
                        break;
                    case "社会发展局":
                        sb.Append(",\"Rows\":[");
                        sb.Append("{\"IndustryCode\": \"108\",\"IndustryName\": \"料土堆\"},");
                        sb.Append("{\"IndustryCode\": \"103\",\"IndustryName\": \"养殖场\"}");
                        sb.Append("]");
                        break;
                    case "综合执法局":
                        sb.Append(",\"Rows\":[");
                        sb.Append("{\"IndustryCode\": \"110\",\"IndustryName\": \"渣土车\"},");
                        sb.Append("{\"IndustryCode\": \"108\",\"IndustryName\": \"料土堆\"}");
                        sb.Append("]");
                        break;
                    case "公共事业管理局":
                        sb.Append(",\"Rows\":[");
                        sb.Append("{\"IndustryCode\": \"106\",\"IndustryName\": \"污水排放口\"},");
                        sb.Append("{\"IndustryCode\": \"107\",\"IndustryName\": \"道路\"}");
                        sb.Append("]");
                        break;
                    case "规划局":
                        sb.Append(",\"Rows\":[");
                        sb.Append("{\"IndustryCode\": \"104\",\"IndustryName\": \"建筑工地\"}");
                        sb.Append("]");
                        break;
                    default:
                        break;
                }
                sb.Append("}");
            }
            sb = sb.Replace("\n", "").Replace("\r\n", "");

            context.Response.Write(sb.ToString());
        }
        public static string MD5(string input)
        {
            byte[] data = System.Security.Cryptography.MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(input));
            StringBuilder sBuilder = new StringBuilder();
            for (int i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("X2"));
            }
            return sBuilder.ToString();
        }
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
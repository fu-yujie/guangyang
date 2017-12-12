using HJJC.BLL;
using System;
using System.Data;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.WebSockets;

namespace HJJC.widgets.handler
{
    /// <summary>
    /// Summary description for WebSocket_Handler
    /// </summary>
    public class WebSocket_Handler : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            if (context.IsWebSocketRequest)
            {
                context.AcceptWebSocketRequest(ProcessChat);
            }
        }

        private async Task ProcessChat(AspNetWebSocketContext context)
        {
            WebSocket socket = context.WebSocket;
            while (true)
            {
                if (socket.State == WebSocketState.Open)
                {
                    ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[2048]);
                    WebSocketReceiveResult result = await socket.ReceiveAsync(buffer, CancellationToken.None);
                    string userMsg = Encoding.UTF8.GetString(buffer.Array, 0, result.Count);

                    //var dt = TaskListManager.GetAppReply();
                    //string data = DataTableToJson(dt);
                    //if (dt.Rows.Count == 0) { userMsg = "{\"status\":false}"; }
                    //else
                    //{
                    //    userMsg = "{\"status\":true,\"data\":" + data + "}";
                    //}
                    //userMsg = "你发送了：" + userMsg + "于" + DateTime.Now.ToLongTimeString();
                    userMsg = DateTime.Now.ToLongTimeString();
                    buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(userMsg));
                    //socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                    //await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                    Thread.Sleep(1000);
                }
                else
                {
                    break;
                }
            }
        }
        private string DataTableToJson(DataTable dt)
        {
            StringBuilder Json = new StringBuilder();
            if (dt.Rows.Count > 0)
            {
                Json.Append("[");
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    Json.Append("{");
                    for (int j = 0; j < dt.Columns.Count; j++)
                    {
                        Json.Append("\"" + dt.Columns[j].ColumnName.ToString() + "\":\"" + dt.Rows[i][j].ToString() + "\"");
                        if (j < dt.Columns.Count - 1)
                        {
                            Json.Append(",");
                        }
                    }
                    Json.Append("},");
                }
                Json.Remove(Json.Length - 1, 1);
                Json.Append("]");
            }
            return Json.ToString();
        }
        public bool IsReusable => false;
    }
}
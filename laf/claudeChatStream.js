import cloud from '@lafjs/cloud'

// CLAUDE_TOKEN="xxx"
// SLACK_BOT="xxx"
// SLACK_CHAT_ID="ls"

export default async function (ctx: FunctionContext) {
  const { question, conversationId } = ctx.request.body
  return await askCluadeAPi(question, conversationId, ctx)
}

async function askCluadeAPi(question, conversationId, ctx) {
  ctx.response.setHeader('Content-Type', 'application/octet-stream');

  const token = cloud.env.CLAUDE_TOKEN
  const bot = cloud.env.SLACK_BOT
  const chatId = cloud.env.SLACK_CHAT_ID

  // 初始化claude
  const { Authenticator } = await import('claude-api-slack')

  // 通过缓存保存客户端，可以避免每次提问都是在新会话
  let claudeClient = cloud.shared.get('claudeClient')
  if (!claudeClient) {
    claudeClient = new Authenticator(token, bot)
    cloud.shared.set('claudeClient', claudeClient)
  }
  // 创建频道并返回房间ID：channel
  const channel = await claudeClient.newChannel(chatId)
  console.log(`req: ${question}, conversationId: ${conversationId}`);
  let result
  try {
    let postData = {
      text: question,
      channel,
      conversationId,
      onMessage: (originalMessage) => {
        console.log("loading", originalMessage)
        ctx.response.write("⭐" + JSON.stringify(originalMessage));
      }
    }
    if (conversationId) {
      postData.conversationId = conversationId;
    }
    result = await claudeClient.sendMessage(postData);
  } catch (e) {
    ctx.response.write(JSON.stringify(e));
  } finally {
    console.log("success", result)
    ctx.response.end()
  }
}
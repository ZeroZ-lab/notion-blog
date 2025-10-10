import { NotionAPI } from 'notion-client'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL,
  // 添加重试配置以处理临时的 API 错误
  activeUser: undefined,
  authToken: undefined,
  userTimeZone: undefined,
  // 增加超时时间
  timeout: 30000
})

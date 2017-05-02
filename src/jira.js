import request from 'request-promise-native'
import jiraWebhookUrl from './utils/jiraWebhookUrl'

export const api = request.defaults({
  auth: {
    user: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD
  },
  baseUrl: `${process.env.JIRA_HOST}/rest/api/2`,
  json: true
})

export const webhookApi = api.defaults({ baseUrl: `${process.env.JIRA_HOST}/rest/webhooks/1.0` })

const logError = (error) => {
  if (error.statusCode && error.statusCode === 401) {
    console.log('ERROR: Got "Unauthorized" error from JIRA API. Please check JIRA bot credentials!')
  } else {
    console.log(`ERROR: Got error from JIRA API: ${error.name} -- ${error.message}`)
  }
}

export const getIssues = async (user) => {
  let constraints = {
    resolution: 'Unresolved'
  }
  if (user) {
    constraints.assignee = user
  }
  const jql = Object.keys(constraints).map((key) => `${key} = "${constraints[key]}"`).join(' AND ')
  const fields = ['summary']
  try {
    return await api.post('/search', { body: { jql, fields } })
  } catch (error) {
    logError(error)
  }
}

export const findUsers = async (searchStr) => {
  try {
    return await api.get('/user/search', { qs: { username: searchStr } })
  } catch (error) {
    logError(error)
    return []
  }
}

export const createIssue = async (projectKey, issueType, issueSummary) => {
  projectKey = projectKey.toUpperCase()
  issueType = issueType.charAt(0).toUpperCase() + issueType.substr(1).toLowerCase()
  return await api.post('/issue', {
    body: {
      fields: {
        summary: issueSummary,
        issuetype: {
          name: issueType
        },
        project: {
          key: projectKey
        }
      }
    }
  })
}

export const getIssue = async (issueKey) => {
  return await api.get(`/issue/${issueKey}`)
}

export const commentOnIssue = async (issueKey, body) => {
  return await api.post(`/issue/${issueKey}/comment`, {
    body: { body }
  })
}

export const isAdmin = async () => {
  const { permissions } = await api.get('/mypermissions')
  return permissions.ADMINISTER.havePermission
}

export const findWebhook = async () => {
  const webhooks = await webhookApi.get('/webhook')
  return webhooks.find(webhook => webhook.url === jiraWebhookUrl)
}

const webhookDetails = (name) => ({
  name,
  enabled: true,
  events: [
    'jira:issue_updated',
    'jira:issue_created',
    'jira:issue_deleted'
  ],
  excludeBody: false,
  url: jiraWebhookUrl
})

export const createWebhook = async (webhookName) => {
  const body = webhookDetails(webhookName)
  return await webhookApi.post('/webhook', { body })
}

export const updateWebhook = async (existingWebhook) => {
  const body = webhookDetails(existingWebhook.name)
  try {
    return await webhookApi.put(existingWebhook.self, { baseUrl: '', body })
  } catch (error) {
    // If we've received a 409, the webhook already exists, but we still need
    // to make sure it's enabled.
    if (error.statusCode === 409) {
      await webhookApi.put(existingWebhook.self, { baseUrl: '', body: { enabled: true } })
    } else {
      throw error
    }
  }
}

export const linkToIssue = issue => `${process.env.JIRA_HOST}/browse/${issue.key}`

export default {
  commentOnIssue,
  createIssue,
  createWebhook,
  findUsers,
  findWebhook,
  getIssue,
  getIssues,
  isAdmin,
  linkToIssue,
  updateWebhook
}

import request from 'request-promise-native'

export const api = request.defaults({
  auth: {
    user: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD
  },
  baseUrl: `${process.env.JIRA_HOST}/rest/api/2`,
  json: true
})

const logError = (error) => {
  if (error.statusCode && error.statusCode === 401) {
    console.log('ERROR: Got "Unauthorized" error from JIRA API. Please check JIRA bot credentials!')
  } else {
    console.log(`ERROR: Got error from JIRA API: ${error.name}`)
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

export const linkToIssue = issue => `${process.env.JIRA_HOST}/browse/${issue.key}`

export default {
  createIssue,
  findUsers,
  getIssue,
  getIssues,
  linkToIssue
}

import request from 'request-promise-native'

const jiraAPI = request.defaults({
  auth: {
    user: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD
  },
  baseUrl: `${process.env.JIRA_HOST}/rest/api/2`,
  json: true
})

export const getIssues = async () => {
  try {
    const response = await jiraAPI.post('/search', { body: { jql: 'resolution = Unresolved' } })
    return response.issues
  } catch (error) {
    console.log(error)
  }
}

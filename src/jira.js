import request from 'request-promise-native'

export const api = request.defaults({
  auth: {
    user: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD
  },
  baseUrl: `${process.env.JIRA_HOST}/rest/api/2`,
  json: true
})

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
  } catch ({ error }) {
    console.log(error)
  }
}

export const findUsers = async (searchStr) => {
  try {
    return await api.get('/user/search', { qs: { username: searchStr } })
  } catch ({ error }) {
    console.log(error)
  }
}

export default {
  findUsers,
  getIssues
}

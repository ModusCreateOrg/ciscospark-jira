const publicUrl = process.env.PUBLIC_ADDRESS || ''
const baseUrl = publicUrl.slice(-1) === '/' ? publicUrl : `${publicUrl}/`

export default `${baseUrl}jira/receive`

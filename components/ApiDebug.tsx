import { useState, useEffect } from 'react'
import { testBagsAPI } from '@/lib/bags-api'

export const ApiDebug = () => {
  const [apiStatus, setApiStatus] = useState<'testing' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [apiDetails, setApiDetails] = useState<string>('')

  const testAPI = async () => {
    setApiStatus('testing')
    setErrorMessage('')
    setApiDetails('')

    try {
      const result = await testBagsAPI()
      
      if (result && typeof result === 'object' && 'success' in result) {
        // Handle detailed API response
        if (result.success) {
          setApiStatus('success')
          if (result.authIssue) {
            setApiDetails('API accessible but authentication failed - check API key')
          } else if (result.noAuthEndpoints) {
            setApiDetails('API accessible but no authenticated endpoints found')
          } else {
            setApiDetails(`Connected to ${result.baseUrl}${result.endpoint}`)
          }
        } else {
          setApiStatus('error')
          setErrorMessage(result.error || 'API test failed')
          setApiDetails(result.details || 'Check server logs for details')
        }
      } else {
        // Handle boolean result (legacy)
        setApiStatus(result ? 'success' : 'error')
        if (!result) {
          setErrorMessage('API test failed')
          setApiDetails('No working Bags API endpoints found')
        } else {
          setApiDetails('API route working - testing Bags endpoints')
        }
      }
    } catch (error) {
      setApiStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
      setApiDetails('Check server logs for details')
    }
  }

  useEffect(() => {
    testAPI()
  }, [])

  if (apiStatus === null) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
        apiStatus === 'testing' ? 'bg-yellow-500 text-black' :
        apiStatus === 'success' ? 'bg-green-500 text-white' :
        'bg-red-500 text-white'
      }`}>
        {apiStatus === 'testing' && 'Testing API...'}
        {apiStatus === 'success' && 'API Connected ✓'}
        {apiStatus === 'error' && `API Error: ${errorMessage}`}
      </div>
      {apiDetails && (
        <div className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-xs">
          {apiDetails}
        </div>
      )}
    </div>
  )
} 
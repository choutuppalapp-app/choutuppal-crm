'use client'

import { useState } from 'react'
import { Send, Users, MessageCircle, Settings } from 'lucide-react'

export default function Dashboard() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  const handleSend = async () => {
    setStatus('Sending...')
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, text: message })
      })
      const data = await res.json()
      if (data.success) {
        setStatus('Message sent successfully!')
        setPhone('')
        setMessage('')
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch (e) {
      setStatus('Failed to send.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Choutuppal CRM Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Total Contacts</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600"><MessageCircle size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Messages Sent</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600"><Settings size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">System Status</p>
              <p className="text-2xl font-bold text-green-600">Online</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Number (with country code)</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 919876543210"
                className="w-full border p-2 rounded focus:ring-2 outline-none text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full border p-2 rounded focus:ring-2 outline-none text-black"
                rows={3}
              />
            </div>
            <button 
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition"
            >
              <Send size={18} className="mr-2" />
              Send Message
            </button>
            {status && <p className="text-sm mt-2 text-gray-600">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

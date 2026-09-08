import axios from 'axios'

export async function sendWhatsAppMessage(to: string, text: string) {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  
  if (!token || !phoneId) {
    throw new Error('WhatsApp configuration missing')
  }

  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`
  
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  }

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  return response.data
}

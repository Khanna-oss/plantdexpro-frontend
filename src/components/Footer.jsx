import React from 'react'

export default function Footer(){
  return (
    <footer className="mt-8 py-6 text-center text-sm text-gray-500">
      <div>Disclaimer: This app is for informational purposes only. Always consult a professional expert before consuming any plant.</div>
      <div className="mt-2 space-x-4">
        <a className="underline" href="/terms">Terms of Use</a>
        <a className="underline" href="/privacy">Privacy Policy</a>
      </div>
    </footer>
  )
}

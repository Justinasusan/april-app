export default function TestPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600">✅ Test Page</h1>
        <p className="text-gray-500 mt-2">If you can see this, the app is working!</p>
        <p className="text-sm text-gray-400 mt-1">Go to <a href="/login" className="text-[#6D0F2B] underline">/login</a></p>
      </div>
    </div>
  )
}
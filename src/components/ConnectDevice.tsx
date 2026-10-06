import { QRCodeSVG } from 'qrcode.react'

export default function ConnectDevice({ code }: { code: string }) {
  const url = `${window.location.origin}/display/${code}`

  return (
    <div className="space-y-2 rounded-xl bg-emerald-50 p-3 text-center">
      <p className="font-semibold text-emerald-800">Show on another screen</p>
      <QRCodeSVG value={url} size={140} className="mx-auto" />
      <p className="font-mono text-lg tracking-widest">{code}</p>
      <p className="break-all text-xs text-slate-500">{url}</p>
    </div>
  )
}